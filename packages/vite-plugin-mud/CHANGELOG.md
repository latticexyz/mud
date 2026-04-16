# vite-plugin-mud

## 2.2.23

## 2.2.22

## 2.2.21

## 2.2.20

## 2.2.19

## 2.2.18

### Patch Changes

- 7106953: Fixed an issue with providing world deploy's start block to Vite app's env.

## 2.2.17

## 2.2.16

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
