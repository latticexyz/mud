---
"@latticexyz/abi-ts": minor
"@latticexyz/cli": minor
---

Added a new `@latticexyz/abi-ts` package to generate TS type declaration files (`.d.ts`) for each ABI JSON file.

This allows you to import your JSON ABI and use it directly with libraries like [viem](https://npmjs.com/package/viem) and [abitype](https://npmjs.com/package/abitype).

```
pnpm add @latticexyz/abi-ts
pnpm abi-ts
```

By default, `abi-ts` looks for files with the glob `**/*.abi.json`, but you can customize this glob with the `--input` argument, e.g.

```console
pnpm abi-ts --input 'abi/IWorld.sol/IWorld.abi.json'
```
