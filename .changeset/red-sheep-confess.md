---
"@latticexyz/cli": patch
---

Fixed a few issues with deploys:

- properly handle enums in MUD config
- only deploy each unique module/system once
- waits for transactions serially instead of in parallel, to avoid RPC errors
