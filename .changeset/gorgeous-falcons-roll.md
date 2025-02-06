---
"@latticexyz/world": patch
---

The base `Module` contract now includes default implementations of `install` and `installRoot` that immediately revert, avoiding the need to implement these manually in each module.

You may need to update your install methods with `override` when using this new base contract.

```diff
-function install(bytes memory) public {
+function install(bytes memory) public override {
```

```diff
-function installRoot(bytes memory) public {
+function installRoot(bytes memory) public override {
```
