---
"@latticexyz/store-sync": patch
---

Fixed a race condition in the preconfirmed logs stream by setting up the message listener before setting up the subscription.
