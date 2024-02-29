// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreData } from "./IStoreData.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";
import { IFieldLayoutErrors } from "./IFieldLayoutErrors.sol";
import { IPackedCounterErrors } from "./IPackedCounterErrors.sol";
import { ISchemaErrors } from "./ISchemaErrors.sol";
import { ISliceErrors } from "./ISliceErrors.sol";

/**
 * @title IStore
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */
interface IStore is
  IStoreData,
  IStoreRegistration,
  IStoreErrors,
  IFieldLayoutErrors,
  IPackedCounterErrors,
  ISchemaErrors,
  ISliceErrors
{}
