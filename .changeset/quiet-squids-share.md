---
"@latticexyz/world": major
---

- The previous `Call.withSender` util is replaced with `WorldContextProvider`, since the usecase of appending the `msg.sender` to the calldata is tightly coupled with `WorldContextConsumer` (which extracts the appended context from the calldata).

  The previous `Call.withSender` utility reverted if the call failed and only returned the returndata on success. This is replaced with `callWithContextOrRevert`/`delegatecallWithContextOrRevert`

  ```diff
  -import { Call } from "@latticexyz/world/src/Call.sol";
  +import { WorldContextProvider } from "@latticexyz/world/src/WorldContext.sol";

  -Call.withSender({
  -  delegate: false,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.callWithContextOrRevert({
  +  value: 0,
  +  ...
  +});

  -Call.withSender({
  -  delegate: true,
  -  value: 0,
  -  ...
  -});
  +WorldContextProvider.delegatecallWithContextOrRevert({
  +  ...
  +});
  ```

  In addition there are utils that return a `bool success` flag instead of reverting on errors. This mirrors the behavior of Solidity's low level `call`/`delegatecall` functions and is useful in situations where additional logic should be executed in case of a reverting external call.

  ```solidity
  library WorldContextProvider {
    function callWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender, // Address to append to the calldata as context for msgSender
      uint256 value // Value to pass with the call
    ) internal returns (bool success, bytes memory data);

    function delegatecallWithContext(
      address target, // Address to call
      bytes memory funcSelectorAndArgs, // Abi encoded function selector and arguments to pass to pass to the contract
      address msgSender // Address to append to the calldata as context for msgSender
    ) internal returns (bool success, bytes memory data);
  }
  ```

- `WorldContext` is renamed to `WorldContextConsumer` to clarify the relationship between `WorldContextProvider` (appending context to the calldata) and `WorldContextConsumer` (extracting context from the calldata)

  ```diff
  -import { WorldContext } from "@latticexyz/world/src/WorldContext.sol";
  -import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
  ```

- The `World` contract previously had a `_call` method to handle calling systems via their resource selector, performing accesss control checks and call hooks registered for the system.

  ```solidity
  library SystemCall {
    /**
     * Calls a system via its resource selector and perform access control checks.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function call(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Does not revert if the call fails, but returns a `success` flag along with the returndata.
     */
    function callWithHooks(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bool success, bytes memory data);

    /**
     * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
     * Reverts if the call fails.
     */
    function callWithHooksOrRevert(
      address caller,
      bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs,
      uint256 value
    ) internal returns (bytes memory data);
  }
  ```

- System hooks now are called with the system's resource selector instead of its address. The system's address can still easily obtained within the hook via `Systems.get(resourceSelector)` if necessary.

  ```diff
  interface ISystemHook {
    function onBeforeCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;

    function onAfterCallSystem(
      address msgSender,
  -   address systemAddress,
  +   bytes32 resourceSelector,
      bytes memory funcSelectorAndArgs
    ) external;
  }
  ```
