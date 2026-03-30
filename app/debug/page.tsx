"use client";

import { cofhejs, Encryptable } from "cofhejs/web";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import { isAddress, keccak256, stringToHex } from "viem";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  encryptedVotingAbi,
  encryptedVotingMockAbi,
  getEncryptedVotingAddress,
} from "@/lib/contracts/fhenix-voting";

const ARB_SEPOLIA_CHAIN_ID = arbitrumSepolia.id;
const LOCAL_CHAIN_ID = 31337;
const LOCAL_DEFAULT_MOCK_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" as `0x${string}`;

type ProductForm = {
  name: string;
  url: string;
  tagline: string;
  durationMinutes: string;
};

type ContractOption = {
  label: string;
  value: string;
  kind: "real" | "mock";
};

type LocalContractsResponse = {
  contracts: Record<string, string>;
};

type IndexedProduct = {
  product_id: number;
  name: string;
  url: string;
  tagline: string;
  deadline: number;
  created_at: number;
  owner: string;
  vote_count: number;
  has_voted: boolean;
};

export default function DebugPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: ARB_SEPOLIA_CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: ARB_SEPOLIA_CHAIN_ID });

  const defaultAddress = getEncryptedVotingAddress(chainId) || "";

  const [contractAddress, setContractAddress] = useState<string>(defaultAddress || LOCAL_DEFAULT_MOCK_ADDRESS);
  const [contractKind, setContractKind] = useState<"real" | "mock">("mock");
  const [contractOptions, setContractOptions] = useState<ContractOption[]>([]);
  const [manualContractName, setManualContractName] = useState("CustomContract");
  const [manualContractAddress, setManualContractAddress] = useState("");

  const [productForm, setProductForm] = useState<ProductForm>({
    name: "ShipLens",
    url: "https://shiplens.example",
    tagline: "Track your launch metrics in one place",
    durationMinutes: "120",
  });
  const [indexedProducts, setIndexedProducts] = useState<IndexedProduct[]>([]);
  const [status, setStatus] = useState<string>("");

  const loadIndexedProducts = async () => {
    try {
      const query = address ? `?voter=${address.toLowerCase()}` : "";
      const res = await fetch(`/api/votes/index${query}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(body.error || "Failed to load offchain products.");
        setIndexedProducts([]);
        return;
      }
      const data = (await res.json()) as { products?: IndexedProduct[] };
      setIndexedProducts(data.products ?? []);
    } catch {
      setStatus("Failed to load offchain products.");
      setIndexedProducts([]);
    }
  };

  useEffect(() => {
    const loadLocalContracts = async () => {
      try {
        const res = await fetch("/api/local-contracts");
        const data = (await res.json()) as LocalContractsResponse;

        const options: ContractOption[] = [];
        for (const [name, addr] of Object.entries(data.contracts)) {
          options.push({
            label: `${name}: ${addr}`,
            value: addr,
            kind: name.toLowerCase().includes("mock") ? "mock" : "real",
          });
        }

        const envAddress = getEncryptedVotingAddress(chainId);
        if (envAddress) {
          options.unshift({
            label: `EncryptedVoting (env): ${envAddress}`,
            value: envAddress,
            kind: "real",
          });
        }

        if (!options.some((o) => o.value.toLowerCase() === LOCAL_DEFAULT_MOCK_ADDRESS.toLowerCase())) {
          options.unshift({
            label: `EncryptedVotingMock (localhost): ${LOCAL_DEFAULT_MOCK_ADDRESS}`,
            value: LOCAL_DEFAULT_MOCK_ADDRESS,
            kind: "mock",
          });
        }

        setContractOptions(options);

        if (options.length > 0) {
          setContractAddress(options[0].value);
          setContractKind(options[0].kind);
        }
      } catch {
        setContractOptions([
          {
            label: `EncryptedVotingMock (localhost): ${LOCAL_DEFAULT_MOCK_ADDRESS}`,
            value: LOCAL_DEFAULT_MOCK_ADDRESS,
            kind: "mock",
          },
        ]);
        setContractAddress(LOCAL_DEFAULT_MOCK_ADDRESS);
        setContractKind("mock");
      }

      await loadIndexedProducts();
    };

    loadLocalContracts();
  }, [chainId]);

  const contractAbi = contractKind === "mock" ? encryptedVotingMockAbi : encryptedVotingAbi;

  const targetAddress = useMemo(() => {
    if (!isAddress(contractAddress)) {
      return undefined;
    }
    return contractAddress as `0x${string}`;
  }, [contractAddress]);

  const requiredChainId = contractKind === "mock" ? LOCAL_CHAIN_ID : ARB_SEPOLIA_CHAIN_ID;
  const chainMismatch = isConnected && chainId !== requiredChainId;

  const { data: productCount, refetch: refetchProductCount } = useReadContract({
    address: targetAddress,
    abi: contractAbi,
    functionName: "productCount",
    query: {
      enabled: Boolean(targetAddress) && !chainMismatch,
    },
  });

  const { data: writeHash, writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isWriteConfirming, isSuccess: isWriteConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const ensureRequiredNetwork = async () => {
    if (chainId === requiredChainId) {
      return;
    }
    await switchChainAsync({ chainId: requiredChainId });
  };

  const handleResetOffchain = async () => {
    const response = await fetch("/api/votes/index", { method: "DELETE" });
    if (!response.ok) {
      setStatus("Failed to reset offchain list.");
      return;
    }
    setStatus("Offchain list reset.");
    await loadIndexedProducts();
  };

  const handleSubmitProduct = async () => {
    if (!targetAddress) {
      setStatus("Enter a valid contract address.");
      return;
    }

    try {
      setStatus("Switching chain if needed...");
      await ensureRequiredNetwork();

      const productId = typeof productCount === "bigint" ? Number(productCount) : 0;

      setStatus("Submitting onchain product id...");
      await writeContractAsync({
        address: targetAddress,
        abi: contractAbi,
        functionName: "submitProduct",
        args: contractKind === "mock" ? [] : [productForm.name, productForm.url, productForm.tagline],
      });

      const offchainResponse = await fetch("/api/votes/index", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          name: productForm.name,
          url: productForm.url,
          tagline: productForm.tagline,
          description: "",
          owner: (address || "").toLowerCase(),
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      if (!offchainResponse.ok) {
        const body = (await offchainResponse.json().catch(() => ({}))) as { error?: string };
        setStatus(body.error || "Onchain submitted but offchain store failed.");
      } else {
        setStatus("Product submitted onchain and stored offchain.");
      }

      await refetchProductCount();
      await loadIndexedProducts();
    } catch {
      setStatus("submitProduct failed.");
    }
  };

  const handleToggleVote = async (productId: number, voted: boolean) => {
    if (!targetAddress || !address) {
      setStatus("Connect wallet and set valid contract.");
      return;
    }

    try {
      setStatus("Switching chain if needed...");
      await ensureRequiredNetwork();

      if (contractKind === "mock") {
        await writeContractAsync({
          address: targetAddress,
          abi: contractAbi,
          functionName: "setVoteState",
          args: [BigInt(productId), voted],
        });
      } else {
        if (!walletClient || !publicClient) {
          setStatus("Connect wallet on the required network first.");
          return;
        }

        const initResult = await cofhejs.initializeWithViem({
          viemClient: publicClient,
          viemWalletClient: walletClient,
          environment: "TESTNET",
        });

        if (!initResult.success) {
          setStatus(`CoFHE init failed: ${initResult.error.message}`);
          return;
        }

        const encrypted = await cofhejs.encrypt([Encryptable.uint8(voted ? BigInt(1) : BigInt(0))] as const);

        if (!encrypted.success) {
          setStatus(`Encryption failed: ${encrypted.error.message}`);
          return;
        }

        const [encryptedVote] = encrypted.data;
        await writeContractAsync({
          address: targetAddress,
          abi: contractAbi,
          functionName: "setEncryptedVoteState",
          args: [
            BigInt(productId),
            {
              ctHash: encryptedVote.ctHash,
              securityZone: encryptedVote.securityZone,
              utype: encryptedVote.utype,
              signature: encryptedVote.signature as `0x${string}`,
            },
          ],
        });
      }

      const offchainVoteResponse = await fetch("/api/votes/index", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          voter: address.toLowerCase(),
          voted,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      if (!offchainVoteResponse.ok) {
        setStatus("Onchain vote updated but offchain vote state failed.");
        return;
      }

      setStatus(voted ? "Vote added." : "Vote removed.");
      await loadIndexedProducts();
    } catch {
      setStatus("Vote update failed.");
    }
  };

  const handleAddContract = async () => {
    if (!isAddress(manualContractAddress)) {
      setStatus("Manual contract address is invalid.");
      return;
    }

    try {
      const response = await fetch("/api/local-contracts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: manualContractName || "CustomContract",
          address: manualContractAddress,
        }),
      });
      const data = (await response.json()) as LocalContractsResponse & { ok?: boolean };

      if (!response.ok) {
        setStatus("Failed to save contract.");
        return;
      }

      const options: ContractOption[] = [];
      for (const [name, addr] of Object.entries(data.contracts)) {
        options.push({
          label: `${name}: ${addr}`,
          value: addr,
          kind: name.toLowerCase().includes("mock") ? "mock" : "real",
        });
      }

      setContractOptions(options);
      setContractAddress(manualContractAddress);
      setContractKind(manualContractName.toLowerCase().includes("mock") ? "mock" : "real");
      setStatus("Contract saved locally.");
    } catch {
      setStatus("Failed to save contract.");
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
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Product Voting Debug</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16 space-y-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Contract Selector</CardTitle>
            <CardDescription>Select existing local contract or add a new one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={contractAddress}
              onChange={(e) => {
                const selected = contractOptions.find((opt) => opt.value === e.target.value);
                setContractAddress(e.target.value);
                if (selected) setContractKind(selected.kind);
              }}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
            >
              {contractOptions.length === 0 ? (
                <option value="">No local contracts saved</option>
              ) : (
                contractOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>

            <div className="grid gap-3 md:grid-cols-3">
              <Input value={manualContractName} onChange={(e) => setManualContractName(e.target.value)} placeholder="Contract label" />
              <Input value={manualContractAddress} onChange={(e) => setManualContractAddress(e.target.value)} placeholder="0x..." className="md:col-span-2" />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleAddContract}>Add contract</Button>
              <p className="text-sm text-slate-600">Current mode: {contractKind === "mock" ? "Mock local vote state" : "Real CoFHE"}</p>
            </div>

            {status && <p className="text-sm text-slate-600">{status}</p>}
            {writeHash && <p className="text-xs font-mono text-slate-600 break-all">tx: {writeHash}</p>}
            {isWriteConfirming && <p className="text-sm text-amber-600">Waiting for confirmation...</p>}
            {isWriteConfirmed && <p className="text-sm text-emerald-600">Transaction confirmed.</p>}
          </CardContent>
        </Card>

        {!isConnected ? (
          <Card className="bg-white/50 border-dashed border-2 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-slate-700 font-medium mb-2">Wallet not connected</p>
              <p className="text-slate-500 max-w-sm mb-6">Connect wallet and switch to the required network.</p>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Contract + Network</CardTitle>
                <CardDescription>Target product voting contract on the required chain.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="font-mono text-sm"
                />
                {chainMismatch && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Connected chain id {chainId}. Required: {requiredChainId} ({contractKind === "mock" ? "Local Hardhat" : "Arbitrum Sepolia"}).
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3"
                      disabled={isSwitchingChain}
                      onClick={() => switchChainAsync({ chainId: requiredChainId })}
                    >
                      {isSwitchingChain ? "Switching..." : "Switch Chain"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Add Product</CardTitle>
                <CardDescription>onchain product id + local sqlite metadata storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                <Input value={productForm.url} onChange={(e) => setProductForm((p) => ({ ...p, url: e.target.value }))} placeholder="Product URL" />
                <Input value={productForm.tagline} onChange={(e) => setProductForm((p) => ({ ...p, tagline: e.target.value }))} placeholder="Tagline" />
                <Input value={productForm.durationMinutes} onChange={(e) => setProductForm((p) => ({ ...p, durationMinutes: e.target.value }))} placeholder="Duration minutes" />
                <Button className="w-full" disabled={isWritePending || chainMismatch || !targetAddress} onClick={handleSubmitProduct}>
                  {isWritePending ? "Submitting..." : "Add Product"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Offchain Product List (Local SQLite)</CardTitle>
                <CardDescription>Vote/unvote directly from product cards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={loadIndexedProducts}>
                    Refresh Offchain List
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetOffchain}>
                    Reset Offchain List
                  </Button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm space-y-2">
                  {indexedProducts.length === 0 ? (
                    <p>No offchain products found.</p>
                  ) : (
                    indexedProducts.map((product) => {
                      const hasVoted = product.has_voted;
                      const isOwner = Boolean(address) && product.owner.toLowerCase() === (address || "").toLowerCase();

                      return (
                        <div key={product.product_id} className="rounded border border-slate-100 p-3 space-y-2">
                          <p className="font-semibold">#{product.product_id} {product.name}</p>
                          <p className="text-slate-600">{product.tagline}</p>
                          <p className="text-slate-600">{product.url}</p>
                          <p className="text-slate-700">votes: {product.vote_count}</p>
                          {isOwner ? (
                            <p className="text-xs text-amber-700">Owner cannot vote own product.</p>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={hasVoted ? "outline" : "default"}
                                disabled={isWritePending || chainMismatch || !targetAddress || !address}
                                onClick={() => handleToggleVote(product.product_id, !hasVoted)}
                              >
                                {hasVoted ? "Remove vote" : "Vote"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Onchain Summary</CardTitle>
                <CardDescription>Public aggregate counts only.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                  <p>onchain productCount: {typeof productCount === "bigint" ? productCount.toString() : "--"}</p>
                  <p>offchain list count: {indexedProducts.length}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchProductCount()}>
                  Refresh Onchain Count
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
