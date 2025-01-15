# vite-plugin-mud

Vite plugin for MUD projects

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
