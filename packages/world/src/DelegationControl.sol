// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { WorldContextConsumer } from "./WorldContext.sol";
import { IDelegationControl } from "./interfaces/IDelegationControl.sol";

abstract contract DelegationControl is WorldContextConsumer, IDelegationControl {}
