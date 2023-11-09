---
"@latticexyz/common": major
---

- Removed `keyTuple` argument from `renderCommonData`.
- Removed `_keyArgs`, `_typedKeyArgs`, `_keyTupleDefinition` return parameters from `renderCommonData`.
- Changed the arguments of `renderWithStore`'s callback to be named properties of a single object.
- Added `renderWithKey` helper, which provides a callback with `{ _keyArgs, _typedKeyArgs, _keyTupleDefinition }` arguments.
- - Use `renderWithKey` instead of `renderCommonData` if you need keyTuple data.
