---
"@latticexyz/abi-ts": patch
"@latticexyz/block-logs-stream": patch
"@latticexyz/common": patch
"@latticexyz/config": patch
"@latticexyz/dev-tools": patch
"@latticexyz/faucet": patch
"@latticexyz/gas-report": patch
"@latticexyz/noise": patch
"@latticexyz/phaserx": patch
"@latticexyz/protocol-parser": patch
"@latticexyz/react": patch
"@latticexyz/recs": patch
"@latticexyz/schema-type": patch
"@latticexyz/services": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/utils": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": patch
---

TS packages now generate their respective `.d.ts` type definition files for better compatibility when using MUD with `moduleResolution` set to `bundler` or `node16` and fixes issues around missing type declarations for dependent packages.
