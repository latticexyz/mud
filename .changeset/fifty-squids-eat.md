---
"@latticexyz/common": minor
---

Add utils for using viem with MUD

- `mudFoundry` chain with a transaction request formatter that temporarily removes max fees to work better with anvil `--base-fee 0`
- `createBurnerAccount` that also temporarily removes max fees during transaction signing to work better with anvil `--base-fee 0`
- `mudTransportObserver` that will soon let MUD Dev Tools observe transactions

You can use them like:

```ts
import { createBurnerAccount, mudTransportObserver } from "@latticexyz/common";
import { mudFoundry } from "@latticexyz/common/chains";

createWalletClient({
  account: createBurnerAccount(privateKey),
  chain: mudFoundry,
  transport: mudTransportObserver(http()),
  pollingInterval: 1000,
});
```
