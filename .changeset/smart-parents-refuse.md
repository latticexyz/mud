---
"@latticexyz/explorer": patch
---

World Explorer package now exports an `observer` Viem decorator that can be used to get visibility into contract writes initiated from your app. You can watch these writes stream in on the new "Observe" tab of the World Explorer.

```ts
import { createClient, publicActions, walletActions } from "viem";
import { observer } from "@latticexyz/explorer/observer";

const client = createClient({ ... })
  .extend(publicActions)
  .extend(walletActions)
  .extend(observer());
```

By default, the `observer` action assumes the World Explorer is running at `http://localhost:13690`, but this can be customized with the `explorerUrl` option.

```ts
observer({
  explorerUrl: "http://localhost:4444",
});
```

If you want to measure the timing of transaction-to-state-change, you can also pass in a `waitForStateChange` function that takes a transaction hash and returns a partial [`TransactionReceipt`](https://viem.sh/docs/glossary/types#transactionreceipt) with `blockNumber`, `status`, and `transactionHash`. This mirrors the `waitForTransaction` function signature returned by `syncTo...` helper in `@latticexyz/store-sync`.

```ts
observer({
  async waitForStateChange(hash) {
    return await waitForTransaction(hash);
  },
});
```
