// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IErrors } from "./IErrors.sol";

interface IStoreDynamicPartial is IErrors {
  // Push encoded items to the dynamic field at schema index
  function pushToField(uint256 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata dataToPush) external;

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    uint256 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) external;
}
