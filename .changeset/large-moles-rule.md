---
"@latticexyz/entrykit": patch
---

Renamed `deploy-local-prereqs` bin to `entrykit-deploy`, which now accepts an RPC URL so that you can deploy the EntryKit prerequisites to your chain of choice.

```
RPC_URL=http://rpc.garnetchain.com pnpm entrykit-deploy
```

This bin supports specifying the RPC URL via `RPC_URL`, `RPC_HTTP_URL`, `FOUNDRY_ETH_RPC_URL` environment variables or `FOUNDRY_PROFILE` if using `eth_rpc_url` in `foundry.toml`.
