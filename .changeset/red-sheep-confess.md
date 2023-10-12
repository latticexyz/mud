---
"@latticexyz/cli": patch
---

Fixed a few issues with deploys:
- properly handle enums in MUD config
- only deploy each unique module/system once
- wait for last transaction instead of all transactions to avoid local RPC issues
