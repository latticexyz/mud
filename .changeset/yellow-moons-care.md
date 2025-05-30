---
"@latticexyz/entrykit": patch
---

Until we can add ERC-6492 support to our `CallWithSignature` module, EntryKit will now throw a readable error when signing a message using ERC-6492 instead of failing the transaction.
