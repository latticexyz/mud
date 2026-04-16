# @latticexyz/world-module-erc20

## 2.2.23

### Patch Changes

- b803eb1: Bumped forge-std version and removed ds-test dependency (not needed in current forge-std versions)
- Updated dependencies [94cac74]
- Updated dependencies [a8c404b]
- Updated dependencies [cd0fa57]
- Updated dependencies [b803eb1]
- Updated dependencies [122945e]
  - @latticexyz/world@2.2.23
  - @latticexyz/store@2.2.23
  - @latticexyz/schema-type@2.2.23
  - @latticexyz/world-consumer@2.2.23

## 2.2.22

### Patch Changes

- Updated dependencies [6008573]
- Updated dependencies [6a26a04]
- Updated dependencies [f6d87ed]
- Updated dependencies [fb2745a]
- Updated dependencies [03af917]
- Updated dependencies [d83a0fd]
  - @latticexyz/world@2.2.22
  - @latticexyz/world-consumer@2.2.22
  - @latticexyz/store@2.2.22
  - @latticexyz/schema-type@2.2.22

## 2.2.21

### Patch Changes

- 041031d: `WorldConsumer` now doesn't store a single namespace. Instead, child contracts can keep track of namespaces and use the `onlyNamespace(namespace)` and `onlyNamespaceOwner(namespace)` modifiers for access control.

  ERC20 module was adapted to use this new version of `WorldConsumer`.

- Updated dependencies [8cdc57b]
- Updated dependencies [041031d]
  - @latticexyz/world@2.2.21
  - @latticexyz/world-consumer@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- b774ab2: Migrated from `store-consumer` to `world-consumer`.
- 3915759: Removed unsupported install methods as these now automatically revert in the base `Module` contract.
- Updated dependencies [3187081]
- Updated dependencies [06e48e0]
- Updated dependencies [3915759]
- Updated dependencies [06e48e0]
- Updated dependencies [3187081]
- Updated dependencies [b774ab2]
  - @latticexyz/world@2.2.20
  - @latticexyz/store@2.2.20
  - @latticexyz/world-consumer@2.2.20
  - @latticexyz/schema-type@2.2.20

## 2.2.19

### Patch Changes

- @latticexyz/schema-type@2.2.19
- @latticexyz/store@2.2.19
- @latticexyz/store-consumer@2.2.19
- @latticexyz/world@2.2.19

## 2.2.18

### Patch Changes

- 5d6fb1b: Updates `WithWorld` to be a `System`, so that functions in child contracts that use the `onlyWorld` or `onlyNamespace` modifiers must be called through the world in order to safely support calls from systems.
- 88949aa: Updated table names to pascal case for consistency.
- Updated dependencies [5d6fb1b]
  - @latticexyz/store-consumer@2.2.18
  - @latticexyz/store@2.2.18
  - @latticexyz/world@2.2.18
  - @latticexyz/schema-type@2.2.18

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
