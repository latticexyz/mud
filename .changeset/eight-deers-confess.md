---
"@latticexyz/world": patch
---

Register the `store` namespace in the `CoreModule`.
Since namespaces are a World concept, registering the Store's internal tables does not automatically register the Store's namespace, so we do this manually during initialization in the `CoreModule`.
