---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Added `sourceDirectory` as a top-level config option for specifying contracts source (i.e. Solidity) directory relative to the MUD config. This is used to resolve other paths in the config, like codegen and user types. Like `foundry.toml`, this defaults to `src` and should be kept in sync with `foundry.toml`.

Also added a `codegen.namespaceDirectories` option to organize codegen output (table libraries, etc.) into directories by namespace. For example, a `Counter` table in the `app` namespace will have codegen at `codegen/app/tables/Counter.sol`. If not set, defaults to `true` when using top-level `namespaces` key, `false` otherwise.
