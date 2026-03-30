"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { encryptedVotingAbi } from "@/lib/contracts/fhenix-voting";

const ARB_SEPOLIA_CHAIN_ID = 421614;
const ENCRYPTED_VOTING_ADDRESS = "0xa28f103de761fbf88CE69Ac813A5F906F83c75f3" as `0x${string}`;

type ProductForm = {
  name: string;
  url: string;
  tagline: string;
  description: string;
};

export default function SubmitProductPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [contractAddress, setContractAddress] = useState<string>(ENCRYPTED_VOTING_ADDRESS);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<ProductForm>({
    name: "",
    url: "",
    tagline: "",
    description: "",
  });

  const targetAddress = useMemo(() => {
    if (!isAddress(contractAddress)) {
      return undefined;
    }
    return contractAddress as `0x${string}`;
  }, [contractAddress]);

  const chainMismatch = isConnected && chainId !== ARB_SEPOLIA_CHAIN_ID;

  const { data: productCount, refetch: refetchProductCount } = useReadContract({
    address: targetAddress,
    abi: encryptedVotingAbi,
    functionName: "productCount",
    query: {
      enabled: Boolean(targetAddress),
    },
  });

  const { data: writeHash, writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isWriteConfirming, isSuccess: isWriteConfirmed } = useWaitForTransactionReceipt({ hash: writeHash });

  const ensureRequiredNetwork = async () => {
    if (chainId === ARB_SEPOLIA_CHAIN_ID) return;
    await switchChainAsync({ chainId: ARB_SEPOLIA_CHAIN_ID });
  };

  const handleSubmit = async () => {
    if (!targetAddress || !address) {
      setStatus("Connect wallet and set valid contract address.");
      return;
    }

    try {
      setStatus("Switching to Arbitrum Sepolia...");
      await ensureRequiredNetwork();

      const nextProductId = typeof productCount === "bigint" ? Number(productCount) : 0;

      setStatus("Submitting product onchain...");
      await writeContractAsync({
        address: targetAddress,
        abi: encryptedVotingAbi,
        functionName: "submitProduct",
        args: [form.name, form.url, form.tagline],
      });

      const offchainResponse = await fetch("/api/votes/index", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: nextProductId,
          name: form.name,
          url: form.url,
          tagline: form.tagline,
          description: form.description,
          owner: address.toLowerCase(),
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      if (!offchainResponse.ok) {
        setStatus("Onchain submitted but offchain save failed.");
        return;
      }

      setStatus("Product submitted successfully.");
      await refetchProductCount();
    } catch {
      setStatus("Submit failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back home
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Arbitrum Sepolia</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Submit Product</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-700 sm:text-lg">
            Add product metadata offchain and register the product on the deployed encrypted contract.
          </p>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200 sm:p-8 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">EncryptedVoting contract address</p>
            <Input value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} className="font-mono border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" />
          </div>

          {chainMismatch && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Connected chain {chainId}. Required: {ARB_SEPOLIA_CHAIN_ID}.
              <Button variant="outline" size="sm" className="ml-3 border-amber-400 text-amber-900 hover:bg-amber-100" onClick={() => switchChainAsync({ chainId: ARB_SEPOLIA_CHAIN_ID })} disabled={isSwitchingChain}>
                {isSwitchingChain ? "Switching..." : "Switch to Arbitrum Sepolia"}
              </Button>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Product name</p>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Product URL</p>
            <Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="Product URL" className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Tagline</p>
            <Input value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} placeholder="Tagline" className="border-slate-300 bg-white text-slate-950 placeholder:text-slate-400" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Description (Markdown)</p>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="min-h-56 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="# Product title\n\nWrite your product description in markdown."
            />
          </div>

          <Button onClick={handleSubmit} disabled={isWritePending || !isConnected || !targetAddress} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
            {isWritePending ? "Submitting..." : "Submit product"}
          </Button>

          {status && <p className="text-sm font-medium text-slate-800">{status}</p>}
          {writeHash && <p className="text-xs font-mono text-slate-700 break-all">tx: {writeHash}</p>}
          {isWriteConfirming && <p className="text-sm text-amber-700">Waiting confirmation...</p>}
          {isWriteConfirmed && <p className="text-sm text-emerald-700">Transaction confirmed.</p>}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            <p>Onchain productCount: {typeof productCount === "bigint" ? productCount.toString() : "--"}</p>
          </div>

          <Link href="/leaderboard" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700">
            View leaderboard
          </Link>
        </section>
      </main>
    </div>
  );
}
