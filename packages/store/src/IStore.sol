// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreData } from "./IStoreData.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";
import { IPackedCounterErrors } from "./IPackedCounterErrors.sol";
import { IFieldLayoutErrors } from "./IFieldLayoutErrors.sol";

/**
 * @title IStore
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */
interface IStore is IStoreData, IStoreRegistration, IStoreErrors, IFieldLayoutErrors, IPackedCounterErrors {}
