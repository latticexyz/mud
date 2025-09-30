# @latticexyz/world-module-callwithsignature

## 2.2.24

### Patch Changes

- @latticexyz/store@2.2.24
- @latticexyz/world@2.2.24
- @latticexyz/schema-type@2.2.24

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

- Updated dependencies [8cdc57b]
  - @latticexyz/world@2.2.21
  - @latticexyz/store@2.2.21
  - @latticexyz/schema-type@2.2.21

## 2.2.20

### Patch Changes

- 3915759: Removed unsupported install methods as these now automatically revert in the base `Module` contract.
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

- ffefc8f: `CallWithSignature` module has been moved out of `@latticexyz/world-modules` and into its own package at `@latticexyz/world-module-callwithsignature`. This module is now installed by default during deploy as its needed by EntryKit.

  If you previously had this module installed in your MUD config, you can now remove it.

  ```diff
   export default defineConfig({
     tables: {
       ...
     },
  -  modules: [
  -    {
  -      artifactPath:
  -        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
  -      root: true,
  -    },
  -  ],
   });
  ```

- Updated dependencies [94d82cf]
- Updated dependencies [7c3df69]
- Updated dependencies [56e65f6]
  - @latticexyz/world@2.2.17
  - @latticexyz/store@2.2.17
  - @latticexyz/schema-type@2.2.17
