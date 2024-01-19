---
"@latticexyz/world-modules": patch
"@latticexyz/world": major
---

World function signatures for namespaced systems have changed from `{namespace}_{systemName}_{functionName}` to `{namespace}__{functionName}` (double underscore, no system name). This is more ergonomic and is more consistent with namespaced resources in other parts of the codebase (e.g. MUD config types, table names in the schemaful indexer).

If you have a project using the `namespace` key in your `mud.config.ts` or are manually registering systems and function selectors on a namespace, you will likely need to codegen your system interfaces (`pnpm build`) and update any calls to these systems through the world's namespaced function signatures.
