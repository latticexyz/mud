---
"@latticexyz/store": major
---

- Always render field methods with a suffix in tablegen (they used to not be rendered if field methods without a suffix were rendered).
- Add `withSuffixlessFieldMethods` to `RenderTableOptions`, which indicates that field methods without a suffix should be rendered.
