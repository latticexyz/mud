// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { IRegistrationSystem } from "./IRegistrationSystem.sol";
import { IWorld } from "./IWorld.sol";

interface IWorldWithSystems is IStore, IWorld, IRegistrationSystem {}
