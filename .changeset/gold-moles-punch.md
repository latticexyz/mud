---
"@latticexyz/world-module-erc20": patch
---

- Rename `defineERC20Config` to `defineERC20Module` and use explicit `Module` type for its output.
- Export `defineERC20Module` from `@latticexyz/world-module-erc20/internal` in order to imply that it is an experimental and unaudited module. 
