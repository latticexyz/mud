// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreRead } from "./IStoreRead.sol";
import { IStoreWrite } from "./IStoreWrite.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";
import { IFieldLayoutErrors } from "./IFieldLayoutErrors.sol";
import { IPackedCounterErrors } from "./IPackedCounterErrors.sol";
import { ISchemaErrors } from "./ISchemaErrors.sol";
import { ISliceErrors } from "./ISliceErrors.sol";

/**
 * @title IStore
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice IStore implements the error interfaces for each library that it uses.
 */
interface IStore is
  IStoreRead,
  IStoreWrite,
  IStoreRegistration,
  IStoreErrors,
  IFieldLayoutErrors,
  IPackedCounterErrors,
  ISchemaErrors,
  ISliceErrors
{
  /**
   * @notice Returns the version of the Store contract.
   * @return version The version of the Store contract.
   */
  function storeVersion() external view returns (bytes32 version);
}
