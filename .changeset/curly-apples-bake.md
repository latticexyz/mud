---
"@latticexyz/cli": patch
---

When upgrading an existing world, the deployer now attempts to read the deploy block number from the `worlds.json` file. If it is found, the `HelloWorld` and `HelloStore` event are fetched from this block instead of searching for the events starting from the genesis block.
