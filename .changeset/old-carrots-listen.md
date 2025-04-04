---
"@latticexyz/explorer": patch
"@latticexyz/store-sync": patch
---

`getWorldAbi_deprecated()`, replicating the previous behavior of `getWorldAbi()` before it was updated to use metadata for ABI construction, has been added. It provides a fallback for existing worlds that lack metadata. The Worlds Explorer's world ABI API endpoint has also been extended with the additional ABI.
