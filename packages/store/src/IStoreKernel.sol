// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreRead } from "./IStoreRead.sol";
import { IStoreWrite } from "./IStoreWrite.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IFieldLayoutErrors } from "./IFieldLayoutErrors.sol";
import { IEncodedLengthsErrors } from "./IEncodedLengthsErrors.sol";
import { ISchemaErrors } from "./ISchemaErrors.sol";
import { ISliceErrors } from "./ISliceErrors.sol";

/**
 * @title IStoreKernel
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice IStore includes the error interfaces for each library that it uses.
 */
interface IStoreKernel is
  IStoreRead,
  IStoreWrite,
  IStoreErrors,
  IFieldLayoutErrors,
  IEncodedLengthsErrors,
  ISchemaErrors,
  ISliceErrors
{
  /**
   * @notice Returns the version of the Store contract.
   * @return version The version of the Store contract.
   */
  function storeVersion() external view returns (bytes32 version);
}
