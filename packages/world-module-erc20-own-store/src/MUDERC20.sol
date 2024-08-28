// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20Errors } from "./IERC20Errors.sol";
import { IERC20Events } from "./IERC20Events.sol";
import { Token } from "./codegen/tables/Token.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { Allowances } from "./codegen/tables/Allowances.sol";

import { Store } from "@latticexyz/store/src/Store.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

contract MUDERC20 is Store, IERC20Errors, IERC20Events {
  constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    StoreCore.initialize();
    StoreCore.registerInternalTables();

    Token.register();
    Balances.register();
    Allowances.register();

    Token.set(_name, _symbol, _decimals);
  }

  /// VIEW FUNCTIONS ///

  /**
   * @dev Returns the name of the token.
   */
  function name() public view returns (string memory) {
    return Token.getName();
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view returns (string memory) {
    return Token.getSymbol();
  }

  /**
   * @dev Returns the decimals of the token.
   */
  function decimals() public view returns (string memory) {
    return Token.getDecimals();
  }

  /**
   * @dev Returns the total supply of the token.
   */
  function totalSupply() public view returns (uint256) {
    return Token.getTotalSupply();
  }
}
