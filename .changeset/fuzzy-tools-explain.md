---
"create-mud": patch
---

Templates now use an `app` namespace by default, instead of the root namespace. This helps keep the root namespace clear for intentionally root-level things and avoids pitfalls with root systems calling other root systems.
