---
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/store": major
---

Changed the `userTypes` property to accept `{ filePath: string, internalType: SchemaAbiType }` to enable strong inference of types from the config.
