import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { env } = getCloudflareContext();

  if (!env.VOTE_INDEXER) {
    return NextResponse.json({ error: "VOTE_INDEXER binding missing" }, { status: 500 });
  }

  const id = env.VOTE_INDEXER.idFromName("global");
  const stub = env.VOTE_INDEXER.get(id);

  const url = new URL(request.url);
  const indexUrl = new URL("https://vote-indexer.internal/index");

  for (const [key, value] of url.searchParams.entries()) {
    indexUrl.searchParams.set(key, value);
  }

  const response = await stub.fetch(indexUrl.toString());

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch vote index" }, { status: 500 });
  }

  const payload = await response.json();
  return NextResponse.json(payload);
}
