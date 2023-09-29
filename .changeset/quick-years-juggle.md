---
"@latticexyz/store": major
"@latticexyz/world": minor
---

- Moves Store events into its own `IStoreEvents` interface
- Moves Store interfaces to their own files
- Adds a `StoreData` abstract contract to initialize a Store and expose the Store version

If you're using MUD out of the box, you won't have to make any changes. You will only need to update if you're using any of the base Store interfaces.
