# @latticexyz/world-module-callwithsignature

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
