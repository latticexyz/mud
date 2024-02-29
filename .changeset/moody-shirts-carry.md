---
"@latticexyz/common": patch
---

Added viem actions that work the same as MUD's `getContract`, `writeContract`, and `sendTransaction`.

Code previously written as:

```ts
const worldContract = mud_getContract({
  // ...
  client: { /* ... */, wallet: walletClient },
  onWrite,
});
```

can now be:

```ts
walletClient = walletClient.extend(transactionQueue()).extend(writeObserver({ onWrite }));
const worldContract = viem_getContract({
  // ...
  client: { /* ... */, wallet: walletClient },
});
```
