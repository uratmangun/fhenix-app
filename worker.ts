export default {
  fetch() {
    return new Response("Build with OpenNext first", { status: 500 });
  },
} satisfies ExportedHandler<CloudflareEnv>;
