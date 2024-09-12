---
"@latticexyz/explorer": patch
"@latticexyz/stash": patch
---

Bumped viem, wagmi, and abitype packages to their latest release.

MUD projects using these packages should do the same to ensure no type errors due to mismatched versions:

```
pnpm recursive up viem@2.21.6 wagmi@2.12.11 @wagmi/core@2.13.5 abitype@1.0.6.
```
