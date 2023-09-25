// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreData } from "./IStoreData.sol";
import { IStoreRegistration } from "./IStoreRegistration.sol";

interface IStore is IStoreData, IStoreRegistration, IStoreErrors {}
