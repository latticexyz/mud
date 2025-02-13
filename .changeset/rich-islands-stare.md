---
"@latticexyz/world-consumer": patch
"@latticexyz/world-module-erc20": patch
---

`WorldConsumer` now doesn't store a single namespace. Instead, child contracts can keep track of namespaces and use the `onlyNamespace(namespace)` and `onlyNamespaceOwner(namespace)` modifiers for access control.

ERC20 module was adapted to use this new version of `WorldConsumer`.
