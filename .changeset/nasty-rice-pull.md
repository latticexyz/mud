---
"@latticexyz/store-sync": minor
---

`createStoreSync` now [waits for idle](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) between each chunk of logs in a block to allow for downstream render cycles to trigger. This means that hydrating logs from an indexer will no longer block until hydration completes, but rather allow for `onProgress` callbacks to trigger.
