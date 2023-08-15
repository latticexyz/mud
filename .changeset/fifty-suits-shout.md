---
"@latticexyz/store-indexer": major
---

Adds a [Fastify](https://fastify.dev/) server in front of tRPC and puts tRPC endpoints under `/trpc` to make way for other top-level endpoints (e.g. [tRPC panel](https://github.com/iway1/trpc-panel) or other API frontends like REST or gRPC).

If you're using `@latticexyz/store-sync` packages with an indexer (either `createIndexerClient` or `indexerUrl` argument of `syncToRecs`), then you'll want to update your indexer URL:

```diff
 createIndexerClient({
-  url: "https://indexer.dev.linfra.xyz",
+  url: "https://indexer.dev.linfra.xyz/trpc",
 });
```

```diff
 syncToRecs({
   ...
-  indexerUrl: "https://indexer.dev.linfra.xyz",
+  indexerUrl: "https://indexer.dev.linfra.xyz/trpc",
 });
```
