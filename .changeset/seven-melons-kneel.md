---
"@latticexyz/cli": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

MUD projects can now use multiple namespaces via a new top-level `namespaces` config option.

```ts
import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  namespaces: {
    game: {
      tables: {
        Player: { ... },
        Position: { ... },
      },
    },
    guilds: {
      tables: {
        Guild: { ... },
      },
      systems: {
        MembershipSystem: { ... },
        TreasurySystem: { ... },
      },
    },
  },
});
```

Once you use the top-level `namespaces` config option, your project will be in "multiple namespaces mode", which expects a source directory structure similar to the config structure: a top-level `namespaces` directory with nested namespace directories that correspond to each namespace label in the config.

```
~/guilds
├── mud.config.ts
└── src
    └── namespaces
        ├── game
        │   └── codegen
        │       └── tables
        │           ├── Player.sol
        │           └── Position.sol
        └── guilds
            ├── MembershipSystem.sol
            ├── TreasurySystem.sol
            └── codegen
                └── tables
                    └── Guild.sol
```
