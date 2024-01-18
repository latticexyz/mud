---
"@latticexyz/world-modules": patch
"@latticexyz/world": major
---

Functions within namespaced systems are now registered on the world as `{namespace}_{functionName}` rather than `{namespace}_{systemName}_{functionName}`. This is more ergonomic and is more consistent with namespaced resources in other parts of the codebase (e.g. accessing tables in schemaful indexer).

If you have a project using the `namespace` key in your `mud.config.ts` or are manually registering systems and function selectors on a namespace, you will likely need to codegen your system interfaces (`pnpm build`) and update any calls to these systems through the world's namespaced function signatures.
