---
"@latticexyz/cli": patch
---

Removed manual gas setting in PostDeploy step of `mud deploy` in favor of `forge script` fetching it from the RPC.

If you still want to manually set gas, you can use `mud deploy --forgeScriptOptions="--with-gas-price 1000000"`.
