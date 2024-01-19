---
"@latticexyz/store": minor
---

Improved error messages for invalid `FieldLayout`s

```diff
-error FieldLayoutLib_InvalidLength(uint256 length);
+error FieldLayoutLib_TooManyFields(uint256 numFields, uint256 maxFields);
+error FieldLayoutLib_TooManyDynamicFields(uint256 numFields, uint256 maxFields);
+error FieldLayoutLib_Empty();
```
