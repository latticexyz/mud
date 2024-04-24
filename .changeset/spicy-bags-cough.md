---
"@latticexyz/world": patch
"@latticexyz/cli": patch
---

Added a `deploy.useProxy` option to the MUD config that deploys the World as an upgradable proxy contract. The proxy behaves like a regular World contract, but the underlying implementation can be upgraded by calling `setImplementation`.
