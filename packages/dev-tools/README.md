# MUD Dev Tools

Developer tools to view and explore and interact with MUD data within your app.

Note that if you create a new MUD app using our `pnpm create mud` tool, MUD Dev Tools will already be included for you.

## Installation

```
npm install @latticexyz/dev-tools
```

## Usage

```ts
// https://vitejs.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
  const { mount: mountDevTools } = await import("@latticexyz/dev-tools");
  mountDevTools({
    config,
    publicClient,
    walletClient,
    latestBlock$,
    storedBlockLogs$,
    worldAddress,
    worldAbi,
    write$,
    // if you're using recs
    recsWorld,
  });
}
```
