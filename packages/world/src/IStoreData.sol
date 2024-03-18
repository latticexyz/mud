// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreRead } from "@latticexyz/store/src/IStoreRead.sol";
import { IStoreWrite } from "@latticexyz/store/src/IStoreWrite.sol";

/**
 * @title IStoreData
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice The IStoreData interface includes methods for reading and writing table values.
 * @dev These methods are frequently invoked during runtime, so it is essential to prioritize optimizing their gas cost.
 */
interface IStoreData is IStoreRead, IStoreWrite {
  /**
   * @notice Returns the version of the Store contract.
   * @return version The version of the Store contract.
   */
  function storeVersion() external view returns (bytes32 version);
}
