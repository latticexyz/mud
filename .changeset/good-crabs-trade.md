---
"@latticexyz/cli": patch
---

When deploying to an existing world, the deployer now paginates with [`fetchLogs`](https://github.com/latticexyz/mud/blob/main/packages/block-logs-stream/src/fetchLogs.ts) to find the world deployment.
