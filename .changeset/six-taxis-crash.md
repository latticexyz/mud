---
"@latticexyz/world-module-metadata": patch
---

Added experimental system library for metadata system. Note that this is marked experimental as we may make breaking changes to the interface.

```solidity
import { metadataSystem } from "@latticexyz/world-metadata-module/src/codegen/experimental/systems/MetadataSystemLib.sol";

metadataSystem.setResourceTag(namespaceId, bytes32("label"), "hello");
```
