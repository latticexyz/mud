# @latticexyz/world-module-erc20

## 2.2.14

### Patch Changes

- 8eaad30: Changed ERC20 and ERC721 related modules to use public library methods instead of manual `delegatecall`s.
  - @latticexyz/schema-type@2.2.14
  - @latticexyz/store@2.2.14
  - @latticexyz/world@2.2.14

## 2.2.13

### Patch Changes

- 23e6a6c: The new ERC20 World Module provides a simpler alternative to the ERC20 Puppet Module, while also being structured in a more extendable way so users can create tokens with custom functionality.

  To install this module, you can import and define the module configuration from the NPM package:

  ```typescript
  import { defineERC20Module } from "@latticexyz/world-module-erc20/internal";

  // Add the output of this function to your World's modules
  const erc20Module = defineERC20Module({ namespace: "erc20Namespace", name: "MyToken", symbol: "MTK" });
  ```

  For detailed installation instructions, please check out the [`@latticexyz/world-module-erc20` README.md](https://github.com/latticexyz/mud/blob/main/packages/world-module-erc20/README.md).

  - @latticexyz/schema-type@2.2.13
  - @latticexyz/store@2.2.13
  - @latticexyz/world@2.2.13
