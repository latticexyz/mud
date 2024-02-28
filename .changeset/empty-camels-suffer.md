---
"@latticexyz/store": major
"@latticexyz/world-modules": minor
---

Moved custom errors out of libraries and interfaces to the file level. In most cases, these errors are contained inside the same file as the library that uses them.

Some have also been renamed:

- `FieldLayoutLib_*` errors to `FieldLayout_*`
- `SchemaLib_*` errors to `Schema_*`
