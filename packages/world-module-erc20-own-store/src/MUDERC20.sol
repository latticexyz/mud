// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20Errors } from "./interfaces/IERC20Errors.sol";
import { IERC20Events } from "./interfaces/IERC20Events.sol";

import { Store } from "@latticexyz/store/src/Store.sol";

contract MUDERC20 is Store, IERC20Errors, IERC20Events {

  constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    
  }

}