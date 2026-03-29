import { VoteIndexerDO } from "./lib/cloudflare/vote-indexer-do";

export default {
  fetch() {
    return new Response("Build with OpenNext first", { status: 500 });
  },
} satisfies ExportedHandler<CloudflareEnv>;

export { VoteIndexerDO };
