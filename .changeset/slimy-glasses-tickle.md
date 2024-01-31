---
"@latticexyz/cli": patch
"create-mud": patch
---

Sped up builds by using more of forge's cache.

Previously we'd build only what we needed because we would check in ABIs and other build artifacts into git, but that meant that we'd get a lot of forge cache misses. Now that we no longer need these files visible, we can take advantage of forge's caching and greatly speed up builds, especially incremental ones.
