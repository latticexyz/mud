---
"@latticexyz/world": major
---

Namespaces are not allowed to contain double underscores ("__") anymore, as this sequence of characters is used to [separate the namespace and function selector](https://github.com/latticexyz/mud/pull/2168) in namespaced systems.
This is to prevent signature clashes of functions in different namespaces.

(Example: If namespaces were allowed to contain this separator string, a function "function" in namespace "namespace__my" would result in the namespaced function selector "namespace__my__function",
and would clash with a function "my__function" in namespace "namespace".)
