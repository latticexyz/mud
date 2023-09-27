// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreRead } from "./IStoreRead.sol";
import { IStoreWrite } from "./IStoreWrite.sol";

/**
 * The IStoreData interface includes methods for reading and writing table values.
 * These methods are frequently invoked during runtime, so it is essential to prioritize
 * optimizing their gas cost
 */
interface IStoreData is IStoreRead, IStoreWrite {
  event HelloStore(bytes32 indexed storeVersion);

  function storeVersion() external view returns (bytes32);
}
