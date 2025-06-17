---
"@latticexyz/store-sync": patch
---

The sync stack now supports defining the chunking behavior during initial hydration. Chunking remains enabled by default.

Chunking is useful to avoid blocking the main thread for too long, but it can lead to updates that happened in the same block being split across multiple chunks.
If chunking is enabled, clients should account for this by waiting for full hydration before using the update stream.
If atomicity of updates is important and blocking the main thread is not an issue, set this to `false`.
