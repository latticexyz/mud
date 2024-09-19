---
"@latticexyz/stash": patch
---

Added `@latticexyz/stash` package, a TypeScript client state library optimized for the MUD Store data model.
It uses the MUD store config to define local tables, which support writing, reading and subscribing to table updates.
It comes with a query engine optimized for "ECS-style" queries (similar to `@latticexyz/recs`) but with native support for composite keys.

You can find usage examples in the [`@latticexyz/stash` README.md](https://github.com/latticexyz/mud/blob/main/packages/stash/README.md).

This package is experimental and will have breaking changes while we refine its APIs and implementation. All of its exports are temporarily under `@latticexyz/stash/internal` until we consider it stable.
