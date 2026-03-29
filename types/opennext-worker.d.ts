declare module "./.open-next/worker.js" {
  const handler: {
    fetch: ExportedHandler<CloudflareEnv>["fetch"];
  };
  export default handler;
  export const DOQueueHandler: unknown;
  export const DOShardedTagCache: unknown;
}
