// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "../../../System.sol";
import { StoreRead } from "@latticexyz/store/src/StoreRead.sol";

import { LimitedCallContext } from "../LimitedCallContext.sol";

/**
 * @title Store Read System
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */
contract StoreReadSystem is System, LimitedCallContext, StoreRead {}
