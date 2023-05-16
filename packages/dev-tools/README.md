# MUD Dev Tools

Developer tools to view and explore and interact with MUD data within your app.

Note that if you create a new MUD app using our `pnpm create mud` tool, MUD Dev Tools will already be included for you.

## Installation

```
npm install @latticexyz/dev-tools
```

## Usage

```ts
import { mount as mountDevTools } from "@latticexyz/dev-tools";

if (process.env.NODE_ENV !== "production") {
  mountDevTools();
}
```
