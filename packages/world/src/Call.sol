// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceSelector } from "./ResourceSelector.sol";
import { FunctionSelectors } from "./tables/FunctionSelectors.sol";
import { Systems } from "./tables/Systems.sol";

library Call {
  /**
   * Call a contract with delegatecall/call and append the given msgSender to the calldata.
   * If the call is successfall, return the returndata as bytes memory.
   * Else, forward the error (with a revert)
   */
  function withSender(
    address msgSender,
    address target,
    bytes memory funcSelectorAndArgs,
    bool delegate
  ) internal returns (bytes memory) {
    // Append msg.sender to the calldata
    bytes memory callData = abi.encodePacked(funcSelectorAndArgs, msgSender);

    // Call the target using `delegatecall` or `call`
    (bool success, bytes memory data) = delegate
      ? target.delegatecall(callData) // root system
      : target.call(callData); // non-root system

    // Forward returned data if the call succeeded
    if (success) return data;

    // Forward error if the call failed
    assembly {
      // data+32 is a pointer to the error message, mload(data) is the length of the error message
      revert(add(data, 0x20), mload(data))
    }
  }

  function internalWithSender(
    address msgSender,
    bytes4 functionSelector,
    bytes memory args
  ) internal returns (bytes memory) {
    (bytes16 namespace, bytes16 file, bytes4 systemFunctionSelector) = FunctionSelectors.get(functionSelector);
    address systemAddress = Systems.getSystem(ResourceSelector.from(namespace, file));
    return
      withSender({
        msgSender: msgSender,
        target: systemAddress,
        funcSelectorAndArgs: abi.encodePacked(systemFunctionSelector, args),
        delegate: false
      });
  }
}
