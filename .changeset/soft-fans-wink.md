---
"@latticexyz/store": minor
"@latticexyz/world": minor
---

Add protocol version with corresponding getter and event on deploy

```solidity
world.worldVersion();
world.storeVersion(); // a World is also a Store
```

```solidity
event HelloWorld(bytes32 indexed worldVersion);
event HelloStore(bytes32 indexed storeVersion);
```
