// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreRead } from "./IStoreRead.sol";
import { IStoreWrite } from "./IStoreWrite.sol";

/**
 * @title IStoreData
 * @notice The IStoreData interface includes methods for reading and writing table values.
 * @dev These methods are frequently invoked during runtime, so it is essential to prioritize optimizing their gas cost.
 */
interface IStoreData is IStoreRead, IStoreWrite {
  /**
   * @notice Emitted when the store is initialized.
   * @param storeVersion The version of the Store contract.
   */
  event HelloStore(bytes32 indexed storeVersion);

  /**
   * @notice Returns the version of the Store contract.
   * @return version The version of the Store contract.
   */
  function storeVersion() external view returns (bytes32 version);
}
