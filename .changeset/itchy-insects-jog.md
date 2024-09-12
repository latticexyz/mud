---
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/config": patch
"@latticexyz/dev-tools": patch
"@latticexyz/explorer": patch
"@latticexyz/faucet": patch
"@latticexyz/protocol-parser": patch
"@latticexyz/schema-type": patch
"@latticexyz/stash": patch
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
"create-mud": patch
---

Bumped viem, wagmi, and abitype packages to their latest release.

MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6
```
