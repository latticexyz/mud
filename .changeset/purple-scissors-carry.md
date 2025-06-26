---
"@latticexyz/entrykit": patch
---

`useSessionClient` will now return an error state when no user is connected. This separates the session client's pending state (querying data to determine if prerequisites are met) from invalid state (EntryKit misconfigured, user not connected, or prerequisites not met), allowing apps to provide better loading indicators within connect buttons.

The built-in `AccountButton` already uses this new behavior to show a pending icon while querying for the session client's prerequisites.
