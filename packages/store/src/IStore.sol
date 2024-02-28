// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStoreData } from "./IStoreData.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";

interface IStore is IStoreData, IStoreRegistration {}
