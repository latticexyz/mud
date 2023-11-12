---
"@latticexyz/cli": major
---

- Added `getPublicLibraries` helper, which returns the data needed to link all public libraries within a given forge output directory

- Added a human-readable error to `ensureContract` about unlinked public libraries

- Added `getContractData` arguments
- - explicit `filename` argument, which used to be inferred based on `contractName`
- - `libraries` argument, which is used to replace bytecode placeholders, to support the use of public libraries

```diff
getContractData(
+  filename: string,
  contractName: string,
  forgeOutDirectory: string,
+  libraries: PublicLibrary[]
)
```

- Made `cli/src/deploy/resolveConfig` asynchronous, and added `libraries` to its result object, which can then be used by `getContractData`

- Added `PublicLibrary` type and `readonly libraries: readonly PublicLibrary[];` to the `Config` type

- Added public libraries to the deployment pipeline
