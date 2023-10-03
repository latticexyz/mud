---
"@latticexyz/world-modules": minor
---

Since [#1564](https://github.com/latticexyz/mud/pull/1564) the World can no longer call itself via an external call.
This made the developer experience of calling other systems via root systems worse, since calls from root systems are executed from the context of the World.
The recommended approach is to use `delegatecall` to the system if in the context of a root system, and an external call via the World if in the context of a non-root system.
To bring back the developer experience of calling systems from other sysyems without caring about the context in which the call is executed, we added the `SystemSwitch` util.

```diff
- // Instead of calling the system via an external call to world...
- uint256 value = IBaseWorld(_world()).callMySystem();

+ // ...you can now use the `SystemSwitch` util.
* // This works independent of whether used in a root system or non-root system.
+ uint256 value = abi.decode(SystemSwitch.call(abi.encodeCall(IBaseWorld.callMySystem, ()), (uint256)); 
```
