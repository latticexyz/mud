// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreRead } from "@latticexyz/store/src/IStoreRead.sol";
import { IStoreWrite } from "@latticexyz/store/src/IStoreWrite.sol";
import { IStoreErrors } from "@latticexyz/store/src/IStoreErrors.sol";
import { IFieldLayoutErrors } from "@latticexyz/store/src/IFieldLayoutErrors.sol";
import { IEncodedLengthsErrors } from "@latticexyz/store/src/IEncodedLengthsErrors.sol";
import { ISchemaErrors } from "@latticexyz/store/src/ISchemaErrors.sol";
import { ISliceErrors } from "@latticexyz/store/src/ISliceErrors.sol";

/**
 * @title IStoreKernel
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice IStoreKernel includes the error interfaces for each library that it uses.
 */
interface IStoreKernel is
  IStoreWrite,
  IStoreErrors,
  IFieldLayoutErrors,
  IEncodedLengthsErrors,
  ISchemaErrors,
  ISliceErrors
{
  /**
   * @notice Returns the protocol version of the Store contract.
   * @return version The protocol version of the Store contract.
   */
  function storeVersion() external view returns (bytes32 version);
}
