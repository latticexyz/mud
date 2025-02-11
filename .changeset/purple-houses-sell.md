---
"@latticexyz/world": patch
---

Updated `encodeSystemCalls` and `encodeSystemCallsFrom` to include the `abi` in each call so that different systems/ABIs can be called in batch. Types have been improved to properly hint/narrow the expected arguments for each call.

```diff
-encodeSystemCalls(abi, [{
+encodeSystemCalls([{
+  abi,
   systemId: '0x...',
   functionName: '...',
   args: [...],
 }]);
```
