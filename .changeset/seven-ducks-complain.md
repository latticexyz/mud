---
"@latticexyz/cli": patch
---

In addition to a hex `--salt`, deploy commands now accept a string salt for world deployment, which will get converted to a hex.

```
pnpm mud deploy --salt hello
```
