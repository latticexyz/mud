---
"@latticexyz/world": major
---

Namespaces are not allowed to contain double underscores ("\_\_") anymore, as this sequence of characters is used to [separate the namespace and function selector](https://github.com/latticexyz/mud/pull/2168) in namespaced systems.
This is to prevent signature clashes of functions in different namespaces.

(Example: If namespaces were allowed to contain this separator string, a function "function" in namespace "namespace\_\_my" would result in the namespaced function selector "namespace\_\_my\_\_function",
and would clash with a function "my\_\_function" in namespace "namespace".)
