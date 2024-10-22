---
"@latticexyz/world-module-erc20": patch
---

The new ERC20 World Module provides a simpler alternative to the ERC20 Puppet Module, while also being structured in a more extendable way so users can create tokens with custom functionality.

To install this module, you can import and define the module configuration from the NPM package:

```typescript
import { defineERC20Module } from "@latticexyz/world-module-erc20/internal";

// Add the output of this function to your World's modules
const moduleDefinition = defineERC20Module({ namespace: "erc20Namespace", name: "MyToken", symbol: "MTK" });
```

For detailed installation instructions, please check out the [`@latticexyz/world-module-erc20` README.md](https://github.com/latticexyz/mud/blob/main/packages/world-module-erc20/README.md).
