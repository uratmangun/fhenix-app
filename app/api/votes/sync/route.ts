import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

type VoteIndexerSyncBody = {
  proposals?: Array<{
    proposalId: number;
    title: string;
    optionsCount: number;
    deadline: number;
    txHash: string;
    blockNumber: number;
    timestamp: number;
  }>;
  votes?: Array<{
    proposalId: number;
    voter: string;
    txHash: string;
    blockNumber: number;
    logIndex: number;
    timestamp: number;
  }>;
  finalizations?: Array<{
    proposalId: number;
    txHash: string;
    blockNumber: number;
    timestamp: number;
  }>;
  syncState?: {
    chainId: number;
    contractAddress: string;
    fromBlock: number;
    toBlock: number;
    syncedAt: number;
    txHash: string;
  };
};

export async function POST(request: Request) {
  const body = (await request.json()) as VoteIndexerSyncBody;
  const { env } = getCloudflareContext();

  if (!env.VOTE_INDEXER) {
    return NextResponse.json({ error: "VOTE_INDEXER binding missing" }, { status: 500 });
  }

  const id = env.VOTE_INDEXER.idFromName("global");
  const stub = env.VOTE_INDEXER.get(id);

  const response = await stub.fetch("https://vote-indexer.internal/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to sync vote index" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
