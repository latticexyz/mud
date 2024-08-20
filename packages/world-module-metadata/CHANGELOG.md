# @latticexyz/world-module-metadata

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
