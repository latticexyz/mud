# vite-plugin-mud

## 2.2.15

### Patch Changes

- 70f224a: Initial release of Vite plugin for MUD projects.

  This will soon be included by default in MUD templates, but you can add to an existing MUD project with:

  ```
  pnpm add -D vite@^6 vite-plugin-mud
  ```

  And use like:

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
