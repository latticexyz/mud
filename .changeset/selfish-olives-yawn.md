---
"@latticexyz/abi-ts": patch
"@latticexyz/block-logs-stream": patch
"@latticexyz/cli": patch
"@latticexyz/common": patch
"@latticexyz/config": patch
"@latticexyz/dev-tools": patch
"@latticexyz/faucet": patch
"@latticexyz/gas-report": patch
"@latticexyz/protocol-parser": patch
"@latticexyz/query": patch
"@latticexyz/react": patch
"@latticexyz/recs": patch
"@latticexyz/schema-type": patch
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
"@latticexyz/store": patch
"@latticexyz/utils": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": patch
"create-mud": patch
"solhint-config-mud": patch
"solhint-plugin-mud": patch
---

TS source has been removed from published packages in favor of DTS in an effort to improve TS performance. All packages now inherit from a base TS config in `@latticexyz/common` to allow us to continue iterating on TS performance without requiring changes in your project code.

If you have a MUD project that you're upgrading, we suggest adding a `tsconfig.json` file to your project workspace that extends this base config.

```sh
pnpm add -D @latticexyz/common
echo "{\n  \"extends\": \"@latticexyz/common/tsconfig.base.json\"\n}" > tsconfig.json
```

Then in each package of your project, inherit from your workspace root's config.

For example, your TS config in `packages/contracts/tsconfig.json` might look like:

```json
{
  "extends": "../../tsconfig.json"
}
```

And your TS config in `packages/client/tsconfig.json` might look like:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "types": ["vite/client"],
    "target": "ESNext",
    "lib": ["ESNext", "DOM"],
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src"]
}
```

You may need to adjust the above configs to include any additional TS options you've set. This config pattern may also reveal new TS errors that need to be fixed or rules disabled.
