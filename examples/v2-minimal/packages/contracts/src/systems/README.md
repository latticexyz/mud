# Systems

In order to automatically generate system abi and type maps (using `mud system-types`), systems must follow some rules:

- Systems must implement the `ISystem` interface.
- Systems must declare an ID following this pattern: `uint256 constant ID = uint256(keccak256("<UNIQUE SYSTEM IDENTIFIER>"));`
- System contracts must be named exactly the same as the file containing them.
