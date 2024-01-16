---
"@latticexyz/world": patch
---

Removed `ROOT_NAMESPACE_STRING` and `ROOT_NAME_STRING` exports in favor of inlining these constants, to avoid reuse as they're meant for internal error messages and debugging.
