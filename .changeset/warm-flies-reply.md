---
"@latticexyz/store-sync": patch
---

`waitForTransaction` now returns a `Promise<{ blockNumber: bigint, status: "success" | "reverted" }>` instead of `Promise<void>`, to allow consumers to react to reverted transactions without refetching the transaction receipt.
