"use client";

import { cofhejs, Encryptable } from "cofhejs/web";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWalletClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { encryptedVotingAbi } from "@/lib/contracts/fhenix-voting";

const ARB_SEPOLIA_CHAIN_ID = 421614;
const ENCRYPTED_VOTING_ADDRESS = "0xa28f103de761fbf88CE69Ac813A5F906F83c75f3" as `0x${string}`;

type ProductDetail = {
  product_id: number;
  name: string;
  url: string;
  tagline: string;
  description: string;
  owner: string;
  vote_count: number;
  has_voted: boolean;
};

type Comment = {
  id: number;
  product_id: number;
  author: string;
  body: string;
  created_at: number;
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: ARB_SEPOLIA_CHAIN_ID });
  const { data: walletClient } = useWalletClient({ chainId: ARB_SEPOLIA_CHAIN_ID });
  const { data: writeHash, writeContractAsync, isPending: isWritePending } = useWriteContract();
  const { isLoading: isWriteConfirming, isSuccess: isWriteConfirmed } = useWaitForTransactionReceipt({ hash: writeHash });

  const [productId, setProductId] = useState<number | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    params.then((resolved) => setProductId(Number(resolved.id)));
  }, [params]);

  const targetAddress = useMemo(() => {
    if (!isAddress(ENCRYPTED_VOTING_ADDRESS)) {
      return undefined;
    }
    return ENCRYPTED_VOTING_ADDRESS;
  }, []);

  const chainMismatch = isConnected && chainId !== ARB_SEPOLIA_CHAIN_ID;

  const loadProduct = async () => {
    if (productId === null) return;
    const query = address ? `?productId=${productId}&voter=${address.toLowerCase()}` : `?productId=${productId}`;
    const res = await fetch(`/api/votes/index${query}`);
    const data = (await res.json()) as { product: ProductDetail | null; comments: Comment[] };
    setProduct(data.product);
    setComments(data.comments ?? []);
  };

  useEffect(() => {
    loadProduct();
  }, [productId, address]);

  const ensureRequiredNetwork = async () => {
    if (chainId === ARB_SEPOLIA_CHAIN_ID) return;
    await switchChainAsync({ chainId: ARB_SEPOLIA_CHAIN_ID });
  };

  const handleVoteToggle = async () => {
    if (!product || !targetAddress || !address) {
      setStatus("Connect wallet first.");
      return;
    }

    if (product.owner.toLowerCase() === address.toLowerCase()) {
      setStatus("Owner cannot vote own product.");
      return;
    }

    try {
      await ensureRequiredNetwork();

      if (!walletClient || !publicClient) {
        setStatus("Connect wallet on Arbitrum Sepolia first.");
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

      const encrypted = await cofhejs.encrypt([Encryptable.uint8(BigInt(!product.has_voted ? 1 : 0))] as const);

      if (!encrypted.success) {
        setStatus(`Encryption failed: ${encrypted.error.message}`);
        return;
      }

      const [encryptedVote] = encrypted.data;
      await writeContractAsync({
        address: targetAddress,
        abi: encryptedVotingAbi,
        functionName: "setEncryptedVoteState",
        args: [
          BigInt(product.product_id),
          {
            ctHash: encryptedVote.ctHash,
            securityZone: encryptedVote.securityZone,
            utype: encryptedVote.utype,
            signature: encryptedVote.signature as `0x${string}`,
          },
        ],
      });

      await fetch("/api/votes/index", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: product.product_id,
          voter: address.toLowerCase(),
          voted: !product.has_voted,
          timestamp: Math.floor(Date.now() / 1000),
        }),
      });

      setStatus(!product.has_voted ? "Vote added." : "Vote removed.");
      await loadProduct();
    } catch {
      setStatus("Vote update failed.");
    }
  };

  const handleComment = async () => {
    if (!product || !address || !commentBody.trim()) {
      setStatus("Connect wallet and enter a comment.");
      return;
    }

    const response = await fetch("/api/votes/index", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: product.product_id,
        author: address.toLowerCase(),
        body: commentBody,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    });

    if (!response.ok) {
      setStatus("Comment failed.");
      return;
    }

    setCommentBody("");
    setStatus("Comment added.");
    await loadProduct();
  };

  if (!product) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-900">Loading...</div>;
  }

  const isOwner = Boolean(address) && product.owner.toLowerCase() === (address || "").toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/leaderboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to leaderboard
          </Link>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{product.name}</h1>
          <p className="mt-3 text-lg text-slate-600">{product.tagline}</p>
          <a href={product.url} className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            {product.url}
          </a>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Streamdown>{product.description}</Streamdown>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Public votes</p>
              <p className="text-2xl font-bold text-slate-900">{product.vote_count}</p>
            </div>
            {isOwner ? (
              <p className="text-sm text-amber-700">Owner cannot vote own product.</p>
            ) : (
              <Button disabled={!isConnected || chainMismatch || !targetAddress || isWritePending} onClick={handleVoteToggle}>
                {product.has_voted ? "Remove vote" : "Vote for product"}
              </Button>
            )}
          </div>
          {chainMismatch && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Connected chain {chainId}. Required: {ARB_SEPOLIA_CHAIN_ID}.
              <Button variant="outline" size="sm" className="ml-3" onClick={() => switchChainAsync({ chainId: ARB_SEPOLIA_CHAIN_ID })} disabled={isSwitchingChain}>
                {isSwitchingChain ? "Switching..." : "Switch to Arbitrum Sepolia"}
              </Button>
            </div>
          )}
          {status && <p className="mt-3 text-sm text-slate-700">{status}</p>}
          {writeHash && <p className="mt-1 text-xs font-mono text-slate-600 break-all">tx: {writeHash}</p>}
          {isWriteConfirming && <p className="mt-1 text-sm text-amber-700">Waiting confirmation...</p>}
          {isWriteConfirmed && <p className="mt-1 text-sm text-emerald-700">Transaction confirmed.</p>}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Comments</h2>
            <p className="text-sm text-slate-600">Connect wallet to leave a comment.</p>
          </div>

          {isConnected ? (
            <div className="space-y-3">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                placeholder="Share feedback about this product"
              />
              <Button onClick={handleComment}>Post comment</Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Connect wallet to comment.
            </div>
          )}

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">{comment.author}</p>
                  <p className="mt-2 text-sm text-slate-900 whitespace-pre-wrap">{comment.body}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
