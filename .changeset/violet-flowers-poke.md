---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Enabled the `namespaces` key in the config. This enables declaring resources in different namespaces in a single MUD config.

For example:

```ts
export default defineWorld({
  namespaces: {
    game: {
      tables: {
        Health: {
          schema: {
            player: "address",
            value: "uint32",
          },
          key: ["player"],
        },
        Position: {
          schema: {
            player: "address",
            x: "int32",
            y: "int32",
          },
          key: ["player"],
        },
      },
    },
    somePlugin: {
      tables: {
        Score: {
          schema: {
            player: "address",
            value: "uint256",
          },
          key: ["player"],
        },
      },
    },
  },
});
```
