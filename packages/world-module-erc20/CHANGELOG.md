# @latticexyz/world-module-erc20

## 2.2.17

### Patch Changes

- Updated dependencies [94d82cf]
- Updated dependencies [7c3df69]
- Updated dependencies [56e65f6]
  - @latticexyz/world@2.2.17
  - @latticexyz/store-consumer@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/schema-type@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/schema-type@2.2.16
- @latticexyz/store@2.2.16
- @latticexyz/store-consumer@2.2.16
- @latticexyz/world@2.2.16

## 2.2.15

### Patch Changes

- d17a9be: Extracted StoreConsumer base contracts into an independent package.
  Added a `registerNamespace` boolean to `WithWorld` to provide more control over namespace registration.
- Updated dependencies [653f378]
- Updated dependencies [2d2aa08]
- Updated dependencies [09e9bd5]
- Updated dependencies [d17a9be]
- Updated dependencies [ba5191c]
- Updated dependencies [1b477d4]
- Updated dependencies [b819749]
- Updated dependencies [22674ad]
- Updated dependencies [509a3cc]
- Updated dependencies [09536b0]
- Updated dependencies [275c867]
  - @latticexyz/world@2.2.15
  - @latticexyz/schema-type@2.2.15
  - @latticexyz/store@2.2.15
  - @latticexyz/store-consumer@2.2.15

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
