"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";

const ARB_SEPOLIA_CHAIN_ID = 421614;
const ENCRYPTED_VOTING_ADDRESS = "0xa28f103de761fbf88CE69Ac813A5F906F83c75f3" as `0x${string}`;

type ProductRow = {
  product_id: number;
  name: string;
  url: string;
  tagline: string;
  description: string;
  owner: string;
  vote_count: number;
  has_voted: boolean;
};

export default function LeaderboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [contractAddress, setContractAddress] = useState<string>(ENCRYPTED_VOTING_ADDRESS);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [status, setStatus] = useState("");

  const targetAddress = useMemo(() => {
    if (!isAddress(contractAddress)) {
      return undefined;
    }
    return contractAddress as `0x${string}`;
  }, [contractAddress]);

  const chainMismatch = isConnected && chainId !== ARB_SEPOLIA_CHAIN_ID;

  const loadProducts = async () => {
    const query = address ? `?voter=${address.toLowerCase()}` : "";
    const res = await fetch(`/api/votes/index${query}`);
    const data = (await res.json()) as { products?: ProductRow[] };
    setProducts(data.products ?? []);
  };

  useEffect(() => {
    loadProducts();
  }, [address]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_60%)]" />
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">Leaderboard</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600 mb-2">EncryptedVoting contract</p>
          <input
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm font-mono"
          />
          {chainMismatch && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Connected chain {chainId}. Required: {ARB_SEPOLIA_CHAIN_ID}.
              <Button variant="outline" size="sm" className="ml-3" onClick={() => switchChainAsync({ chainId: ARB_SEPOLIA_CHAIN_ID })} disabled={isSwitchingChain}>
                {isSwitchingChain ? "Switching..." : "Switch to Arbitrum Sepolia"}
              </Button>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={loadProducts}>Refresh</Button>
            <Link href="/submit-product" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-1.5 text-sm">Submit product</Link>
          </div>
          {status && <p className="mt-2 text-sm text-slate-700">{status}</p>}
        </div>

        <section className="space-y-5">
          {products.length === 0 ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-slate-600">No products yet.</p>
            </article>
          ) : (
            products
              .sort((a, b) => b.vote_count - a.vote_count)
              .map((product, idx) => (
                <Link key={product.product_id} href={`/leaderboard/${product.product_id}`} className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">#{idx + 1} rank</p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{product.name}</h2>
                      <p className="mt-2 text-sm text-slate-600">{product.tagline}</p>
                      <p className="mt-3 text-sm font-medium text-emerald-700">Open product page</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm space-y-1">
                      <p className="text-slate-500">Votes</p>
                      <p className="font-semibold text-slate-900">{product.vote_count}</p>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </section>
      </main>
    </div>
  );
}
