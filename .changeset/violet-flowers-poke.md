---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

You can now configure resources (tables, systems, etc.) across multiple namespaces in a single MUD config using the `namespaces` option.

Note that once you start using `namespaces` config option, you will need to move your existing tables, systems, etc. under the corresponding namespace within `namespaces`.

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
