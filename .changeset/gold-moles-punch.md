---
"@latticexyz/world-module-erc20": patch
---

`defineERC20Config` was renamed to `defineERC20Module` and it now uses the explicit `Module` type for its output.

Now we export `defineERC20Module` from `@latticexyz/world-module-erc20/internal` instead of `index.ts`, to imply that it is an experimental and unaudited module.
