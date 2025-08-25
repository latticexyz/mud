# @latticexyz/store-consumer

## 2.2.23

### Patch Changes

- Updated dependencies [94cac74]
- Updated dependencies [a8c404b]
- Updated dependencies [cd0fa57]
- Updated dependencies [b803eb1]
- Updated dependencies [122945e]
  - @latticexyz/world@2.2.23
  - @latticexyz/store@2.2.23
  - @latticexyz/schema-type@2.2.23

## 2.2.22

### Patch Changes

- Updated dependencies [6008573]
- Updated dependencies [6a26a04]
- Updated dependencies [f6d87ed]
- Updated dependencies [fb2745a]
- Updated dependencies [03af917]
- Updated dependencies [d83a0fd]
  - @latticexyz/world@2.2.22
  - @latticexyz/store@2.2.22
  - @latticexyz/schema-type@2.2.22

## 2.2.21

### Patch Changes

- 041031d: `WorldConsumer` now doesn't store a single namespace. Instead, child contracts can keep track of namespaces and use the `onlyNamespace(namespace)` and `onlyNamespaceOwner(namespace)` modifiers for access control.

  ERC20 module was adapted to use this new version of `WorldConsumer`.

- Updated dependencies [8cdc57b]
  - @latticexyz/world@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- b774ab2: Renamed `store-consumer` package to `world-consumer`. The `world-consumer` package now only includes a single `WorldConsumer` contract that is bound to a `World`.
- Updated dependencies [3187081]
- Updated dependencies [06e48e0]
- Updated dependencies [3915759]
- Updated dependencies [06e48e0]
- Updated dependencies [3187081]
  - @latticexyz/world@2.2.20
  - @latticexyz/store@2.2.20
  - @latticexyz/schema-type@2.2.20

## 2.2.19

### Patch Changes

- @latticexyz/schema-type@2.2.19
- @latticexyz/store@2.2.19
- @latticexyz/world@2.2.19

## 2.2.18

### Patch Changes

- 5d6fb1b: Updates `WithWorld` to be a `System`, so that functions in child contracts that use the `onlyWorld` or `onlyNamespace` modifiers must be called through the world in order to safely support calls from systems.
- Updated dependencies [5d6fb1b]
  - @latticexyz/store@2.2.18
  - @latticexyz/world@2.2.18
  - @latticexyz/schema-type@2.2.18

## 2.2.17

### Patch Changes

- Updated dependencies [94d82cf]
- Updated dependencies [7c3df69]
- Updated dependencies [56e65f6]
  - @latticexyz/world@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/schema-type@2.2.17

## 2.2.16

### Patch Changes

- @latticexyz/schema-type@2.2.16
- @latticexyz/store@2.2.16
- @latticexyz/world@2.2.16

## 2.2.15

### Patch Changes

- d17a9be: Extracted StoreConsumer base contracts into an independent package.
  Added a `registerNamespace` boolean to `WithWorld` to provide more control over namespace registration.
- Updated dependencies [653f378]
- Updated dependencies [2d2aa08]
- Updated dependencies [09e9bd5]
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
