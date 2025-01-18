# cli

## Usage

See usage documentation on the [MUD docs](https://mud.dev/cli/tablegen).

## Development

### Debugging

The CLI can be run in a debug environment:

1. Set the `MUD_PACKAGES` environment variable (see `tsup.config.ts`)
   ```bash
   export MUD_PACKAGES=$(tsx ./scripts/log-mud-packages)
   ```
2. Setup your debugger with `tsx` as the TypeScript loader and `src/mud.ts` as the entrypoint
3. Set the arguments to whichever command you want to run (e.g. `deploy`) and its options.
   - Important: add the `--configPath` option as the path of your project's `mud.config.ts` file, because the current working directory will otherwise be the CLI source.

The CLI should now run in your debugger with TypeScript support.

### Production build

The project can be built for production with `tsup`:

```bash
pnpm build
```

`pnpm link` can be used to run the locally-built package.
