# @latticexyz/world-module-metadata

## 2.2.23

### Patch Changes

- a8c404b: Support expectRevert and unusual nameless arguments in system libraries.
- b803eb1: Bumped forge-std version and removed ds-test dependency (not needed in current forge-std versions)
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

- 6344ced: Adding/deleting resource tags no longer checks if resource exists, only if you're the resource namespace owner.
- 2048adf: Added experimental system library for metadata system. Note that this is marked experimental as we may make breaking changes to the interface.

  ```solidity
  import { metadataSystem } from "@latticexyz/world-metadata-module/src/codegen/experimental/systems/MetadataSystemLib.sol";

  metadataSystem.setResourceTag(namespaceId, bytes32("label"), "hello");
  ```

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

- Updated dependencies [8cdc57b]
  - @latticexyz/world@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- 3915759: Removed unsupported install methods as these now automatically revert in the base `Module` contract.
- 3187081: Metadata module has been updated to install via delegation, making it easier for later module upgrades and to demonstrate modules installed via delegation.
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

## 2.2.14

### Patch Changes

- @latticexyz/schema-type@2.2.14
- @latticexyz/store@2.2.14
- @latticexyz/world@2.2.14

## 2.2.13

### Patch Changes

- @latticexyz/schema-type@2.2.13
- @latticexyz/store@2.2.13
- @latticexyz/world@2.2.13

## 2.2.12

### Patch Changes

- Updated dependencies [ea18f27]
  - @latticexyz/schema-type@2.2.12
  - @latticexyz/store@2.2.12
  - @latticexyz/world@2.2.12

## 2.2.11

### Patch Changes

- Updated dependencies [7ddcf64]
- Updated dependencies [13e5689]
  - @latticexyz/store@2.2.11
  - @latticexyz/world@2.2.11
  - @latticexyz/schema-type@2.2.11

## 2.2.10

### Patch Changes

- Updated dependencies [9d7fc85]
  - @latticexyz/world@2.2.10
  - @latticexyz/schema-type@2.2.10
  - @latticexyz/store@2.2.10

## 2.2.9

### Patch Changes

- @latticexyz/schema-type@2.2.9
- @latticexyz/store@2.2.9
- @latticexyz/world@2.2.9

## 2.2.8

### Patch Changes

- @latticexyz/store@2.2.8
- @latticexyz/world@2.2.8
- @latticexyz/schema-type@2.2.8

## 2.2.7

### Patch Changes

- Updated dependencies [a08ba5e]
  - @latticexyz/store@2.2.7
  - @latticexyz/world@2.2.7
  - @latticexyz/schema-type@2.2.7

## 2.2.6

### Patch Changes

- @latticexyz/schema-type@2.2.6
- @latticexyz/store@2.2.6
- @latticexyz/world@2.2.6

## 2.2.5

### Patch Changes

- @latticexyz/schema-type@2.2.5
- @latticexyz/store@2.2.5
- @latticexyz/world@2.2.5

## 2.2.4

### Patch Changes

- Updated dependencies [50010fb]
- Updated dependencies [1f24978]
  - @latticexyz/schema-type@2.2.4
  - @latticexyz/store@2.2.4
  - @latticexyz/world@2.2.4

## 2.2.3

### Patch Changes

- Updated dependencies [8546452]
  - @latticexyz/world@2.2.3
  - @latticexyz/schema-type@2.2.3
  - @latticexyz/store@2.2.3

## 2.2.2

### Patch Changes

- @latticexyz/schema-type@2.2.2
- @latticexyz/store@2.2.2
- @latticexyz/world@2.2.2

## 2.2.1

### Patch Changes

- @latticexyz/store@2.2.1
- @latticexyz/world@2.2.1
- @latticexyz/schema-type@2.2.1

## 2.2.0

### Patch Changes

- Updated dependencies [04c675c]
- Updated dependencies [04c675c]
  - @latticexyz/store@2.2.0
  - @latticexyz/world@2.2.0
  - @latticexyz/schema-type@2.2.0

## 2.1.1

### Patch Changes

- 6a66f57: Refactored `AccessControl` library exported from `@latticexyz/world` to be usable outside of the world package and updated module packages to use it.
- fad4e85: Added metadata module to be automatically installed during world deploy. This module allows for tagging any resource with arbitrary metadata. Internally, we'll use this to tag resources with labels onchain so that we can use labels to create a MUD project from an existing world.
- Updated dependencies [9e21e42]
- Updated dependencies [6a66f57]
- Updated dependencies [86a8104]
- Updated dependencies [542ea54]
- Updated dependencies [57bf8c3]
  - @latticexyz/schema-type@2.1.1
  - @latticexyz/store@2.1.1
  - @latticexyz/world@2.1.1
