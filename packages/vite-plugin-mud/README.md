# vite-plugin-mud

Vite plugin for MUD projects.

This plugin will use your environment's `VITE_CHAIN_ID` to load the world deploy from your `worlds.json` file and provide it to your app via new environment variables.

| Variable                        | Type                  | Description                                          |
| ------------------------------- | --------------------- | ---------------------------------------------------- |
| `import.meta.env.CHAIN_ID`      | `number`              | The configured chain ID.                             |
| `import.meta.env.WORLD_ADDRESS` | `Hex \| undefined`    | The world contract address (if available).           |
| `import.meta.env.START_BLOCK`   | `number \| undefined` | The block number of the world deploy (if available). |

## Installation

```
pnpm add vite-plugin-mud
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { mud } from "vite-plugin-mud";

export default defineConfig({
  plugins: [mud({ worldsFile: "worlds.json" })],
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-mud/env"]
  }
}
```
