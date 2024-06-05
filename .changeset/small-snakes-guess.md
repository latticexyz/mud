---
"@latticexyz/world": patch
"@latticexyz/cli": patch
---

Added support for namespaced systems. Namespaced systems are declared like regular systems, but the file and contract name is prefixed with the namespace name and two underscores in the form `{namespace}__{system}.sol`. For example, the contract `app__ChatSystem` will be registered as `"ChatSystem"` in the `"app"` namespace.

```solidity
contract app__ChatSystem is System {
  function sendMessage(string memory message) public {
    ...
  }
}
```
