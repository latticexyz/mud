// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { IWorldCore } from "./IWorldCore.sol";

// TODO: autogenerate / auto-include all system interfaces
import { IRegistrationSystem } from "./systems/IRegistrationSystem.sol";

interface IWorld is IStore, IWorldCore, IRegistrationSystem {}
