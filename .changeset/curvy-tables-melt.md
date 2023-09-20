---
"@latticexyz/common": major
---

- Add `renderWithFieldSuffix` helper method to always render a field function with a suffix, and optionally render the same function without a suffix.
- Remove `methodNameSuffix` from `RenderField` interface, because the suffix is now computed as part of `renderWithFieldSuffix`.
