// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreKernel } from "./IStoreKernel.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";

/**
 * @title IStore
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice IStore includes the error interfaces for each library that it uses.
 */
interface IStore is IStoreKernel, IStoreRegistration {}
