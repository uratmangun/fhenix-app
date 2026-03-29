"use client";

import { cofhejs, Encryptable } from "cofhejs/web";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useMemo, useState } from "react";
import { arbitrumSepolia } from "wagmi/chains";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { isAddress, parseEther } from "viem";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  encryptedVotingAbi,
  getEncryptedVotingAddress,
} from "@/lib/contracts/fhenix-voting";

const REQUIRED_CHAIN_ID = arbitrumSepolia.id;

type CreateProposalForm = {
  title: string;
  optionsCount: string;
  durationMinutes: string;
};

export default function DebugPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: REQUIRED_CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: REQUIRED_CHAIN_ID });

  const defaultAddress = getEncryptedVotingAddress(chainId) || "";
  const [contractAddress, setContractAddress] = useState(defaultAddress);
  const [createProposalForm, setCreateProposalForm] = useState<CreateProposalForm>({
    title: "Treasury Rebalancing",
    optionsCount: "3",
    durationMinutes: "120",
  });
  const [voteProposalId, setVoteProposalId] = useState("0");
  const [voteOption, setVoteOption] = useState("0");
  const [resultProposalId, setResultProposalId] = useState("0");
  const [resultOptionId, setResultOptionId] = useState("0");
  const [status, setStatus] = useState<string>("");

  const targetAddress = useMemo(() => {
    if (!isAddress(contractAddress)) {
      return undefined;
    }
    return contractAddress as `0x${string}`;
  }, [contractAddress]);

  const chainMismatch = isConnected && chainId !== REQUIRED_CHAIN_ID;

  const { data: proposalCount, refetch: refetchProposalCount } = useReadContract({
    address: targetAddress,
    abi: encryptedVotingAbi,
    functionName: "proposalCount",
    query: {
      enabled: Boolean(targetAddress) && !chainMismatch,
    },
  });

  const { data: latestProposal } = useReadContract({
    address: targetAddress,
    abi: encryptedVotingAbi,
    functionName: "getProposalSummary",
    args: [proposalCount && proposalCount > BigInt(0) ? proposalCount - BigInt(1) : BigInt(0)],
    query: {
      enabled:
        Boolean(targetAddress) &&
        !chainMismatch &&
        proposalCount !== undefined &&
        proposalCount > BigInt(0),
    },
  });

  const { data: hasVoted } = useReadContract({
    address: targetAddress,
    abi: encryptedVotingAbi,
    functionName: "hasVoted",
    args:
      address && voteProposalId !== ""
        ? [BigInt(voteProposalId), address]
        : undefined,
    query: {
      enabled: Boolean(targetAddress) && !chainMismatch && Boolean(address) && voteProposalId !== "",
    },
  });

  const { data: decryptResult } = useReadContract({
    address: targetAddress,
    abi: encryptedVotingAbi,
    functionName: "decryptResultForOption",
    args:
      resultProposalId !== "" && resultOptionId !== ""
        ? [BigInt(resultProposalId), Number(resultOptionId)]
        : undefined,
    query: {
      enabled: Boolean(targetAddress) && !chainMismatch && resultProposalId !== "" && resultOptionId !== "",
    },
  });

  const {
    data: writeHash,
    writeContractAsync,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    isLoading: isWriteConfirming,
    isSuccess: isWriteConfirmed,
  } = useWaitForTransactionReceipt({ hash: writeHash });

  const ensureArbitrumSepolia = async () => {
    if (chainId === REQUIRED_CHAIN_ID) {
      return;
    }
    await switchChainAsync({ chainId: REQUIRED_CHAIN_ID });
  };

  const handleCreateProposal = async () => {
    if (!targetAddress) {
      setStatus("Enter a valid contract address.");
      return;
    }

    if (!walletClient || !publicClient) {
      setStatus("Connect wallet on Arbitrum Sepolia first.");
      return;
    }

    try {
      setStatus("Switching chain if needed...");
      await ensureArbitrumSepolia();

      const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(createProposalForm.durationMinutes) * 60);
      setStatus("Submitting createProposal transaction...");
      await writeContractAsync({
        address: targetAddress,
        abi: encryptedVotingAbi,
        functionName: "createProposal",
        args: [
          createProposalForm.title,
          Number(createProposalForm.optionsCount),
          deadline,
        ],
      });

      setStatus("createProposal submitted. Waiting for confirmation...");
      await refetchProposalCount();
    } catch {
      setStatus("createProposal failed.");
    }
  };

  const handleVoteEncrypted = async () => {
    if (!targetAddress) {
      setStatus("Enter a valid contract address.");
      return;
    }

    if (!walletClient || !publicClient) {
      setStatus("Connect wallet on Arbitrum Sepolia first.");
      return;
    }

    try {
      setStatus("Switching chain if needed...");
      await ensureArbitrumSepolia();

      setStatus("Initializing CoFHE client...");
      const initResult = await cofhejs.initializeWithViem({
        viemClient: publicClient,
        viemWalletClient: walletClient,
        environment: "TESTNET",
      });

      if (!initResult.success) {
        setStatus(`CoFHE init failed: ${initResult.error.message}`);
        return;
      }

      setStatus("Encrypting vote option...");
      const encrypted = await cofhejs.encrypt([Encryptable.uint8(BigInt(voteOption))] as const);

      if (!encrypted.success) {
        setStatus(`Encryption failed: ${encrypted.error.message}`);
        return;
      }

      const [encryptedOption] = encrypted.data;
      const inEuint8 = {
        ctHash: encryptedOption.ctHash,
        securityZone: encryptedOption.securityZone,
        utype: encryptedOption.utype,
        signature: encryptedOption.signature as `0x${string}`,
      };

      setStatus("Submitting encrypted vote...");
      await writeContractAsync({
        address: targetAddress,
        abi: encryptedVotingAbi,
        functionName: "vote",
        args: [BigInt(voteProposalId), inEuint8],
      });

      setStatus("Encrypted vote submitted. Waiting for confirmation...");
    } catch {
      setStatus("Encrypted vote failed.");
    }
  };

  const handleFinalizeProposal = async () => {
    if (!targetAddress) {
      setStatus("Enter a valid contract address.");
      return;
    }

    try {
      setStatus("Switching chain if needed...");
      await ensureArbitrumSepolia();
      setStatus("Submitting finalizeProposal...");
      await writeContractAsync({
        address: targetAddress,
        abi: encryptedVotingAbi,
        functionName: "finalizeProposal",
        args: [BigInt(resultProposalId)],
      });
      setStatus("Finalize transaction submitted.");
    } catch {
      setStatus("Finalize failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%)]" />

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back Home
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Fhenix Voting Debug</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Encrypted Voting Debugger</h1>
          <p className="text-slate-600">Arbitrum Sepolia execution for CoFHE voting, with encrypted client-side vote submission.</p>
        </div>

        {!isConnected ? (
          <Card className="bg-white/50 border-dashed border-2 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-slate-700 font-medium mb-2">Wallet not connected</p>
              <p className="text-slate-500 max-w-sm mb-6">Connect a wallet, then switch to Arbitrum Sepolia to run encrypted voting calls.</p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Contract + Network</CardTitle>
                <CardDescription>Target EncryptedVoting on Arbitrum Sepolia.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contract Address</label>
                  <Input
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                {chainMismatch && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Connected chain id {chainId}. Required: {REQUIRED_CHAIN_ID} (Arbitrum Sepolia).
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3"
                      disabled={isSwitchingChain}
                      onClick={() => switchChainAsync({ chainId: REQUIRED_CHAIN_ID })}
                    >
                      {isSwitchingChain ? "Switching..." : "Switch Chain"}
                    </Button>
                  </div>
                )}
                {status && <p className="text-sm text-slate-600">{status}</p>}
                {writeHash && (
                  <p className="text-xs font-mono text-slate-600 break-all">tx: {writeHash}</p>
                )}
                {isWriteConfirming && <p className="text-sm text-amber-600">Waiting for confirmation...</p>}
                {isWriteConfirmed && <p className="text-sm text-emerald-600">Transaction confirmed.</p>}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Create Proposal</CardTitle>
                  <CardDescription>Create a new encrypted tally proposal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Title"
                    value={createProposalForm.title}
                    onChange={(e) => setCreateProposalForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  <Input
                    placeholder="Options count (2-8)"
                    value={createProposalForm.optionsCount}
                    onChange={(e) => setCreateProposalForm((p) => ({ ...p, optionsCount: e.target.value }))}
                  />
                  <Input
                    placeholder="Duration minutes"
                    value={createProposalForm.durationMinutes}
                    onChange={(e) => setCreateProposalForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  />
                  <Button
                    className="w-full"
                    disabled={isWritePending || chainMismatch || !targetAddress}
                    onClick={handleCreateProposal}
                  >
                    {isWritePending ? "Submitting..." : "createProposal"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Vote Encrypted</CardTitle>
                  <CardDescription>Encrypt option in-browser, then submit vote.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Proposal id"
                    value={voteProposalId}
                    onChange={(e) => setVoteProposalId(e.target.value)}
                  />
                  <Input
                    placeholder="Option index"
                    value={voteOption}
                    onChange={(e) => setVoteOption(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    disabled={isWritePending || chainMismatch || !targetAddress}
                    onClick={handleVoteEncrypted}
                  >
                    {isWritePending ? "Submitting..." : "voteEncrypted"}
                  </Button>
                  <p className="text-xs text-slate-500">hasVoted: {hasVoted === undefined ? "--" : String(hasVoted)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Finalize</CardTitle>
                  <CardDescription>Request threshold decrypt availability for tally outputs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Proposal id"
                    value={resultProposalId}
                    onChange={(e) => setResultProposalId(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    disabled={isWritePending || chainMismatch || !targetAddress}
                    onClick={handleFinalizeProposal}
                  >
                    {isWritePending ? "Submitting..." : "finalizeProposal"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle>Read Result</CardTitle>
                  <CardDescription>Reads decrypt status + current decrypted value for option.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Option index"
                    value={resultOptionId}
                    onChange={(e) => setResultOptionId(e.target.value)}
                  />
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <p>proposalCount: {proposalCount?.toString() ?? "--"}</p>
                    <p>
                      latestProposal: {latestProposal ? `${latestProposal[0]} / options ${latestProposal[4].toString()}` : "--"}
                    </p>
                    <p>
                      decrypt: {decryptResult ? `${decryptResult[0].toString()} (ready: ${String(decryptResult[1])})` : "--"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchProposalCount()}>
                    Refresh Reads
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
