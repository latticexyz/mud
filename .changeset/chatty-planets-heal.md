---
"@latticexyz/world": minor
---

Added TS helpers for calling systems dynamically via the World.

- `encodeSystemCall` for `world.call`

  ```ts
  worldContract.write.call(encodeSystemCall({
    abi: worldContract.abi,
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCallFrom` for `world.callFrom`

  ```ts
  worldContract.write.callFrom(encodeSystemCallFrom({
    abi: worldContract.abi,
    from: "0x...",
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCalls` for `world.batchCall`

  ```ts
  worldContract.write.batchCall(encodeSystemCalls(abi, [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```

- `encodeSystemCallsFrom` for `world.batchCallFrom`
  ```ts
  worldContract.write.batchCallFrom(encodeSystemCallsFrom(abi, "0x...", [{
    systemId: resourceToHex({ ... }),
    functionName: "registerDelegation",
    args: [ ... ],
  }));
  ```
