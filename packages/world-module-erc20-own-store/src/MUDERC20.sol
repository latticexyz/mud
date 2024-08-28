// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20Errors } from "./IERC20Errors.sol";
import { IERC20Events } from "./IERC20Events.sol";
import { Token } from "./codegen/tables/Token.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { Allowances } from "./codegen/tables/Allowances.sol";

import { Store } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";

contract MUDERC20 is Store, IERC20Errors, IERC20Events {
  constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    StoreCore.initialize();
    StoreCore.registerInternalTables();

    Token.register();
    Balances.register();
    Allowances.register();

    Token.set(_decimals, 0, _name, _symbol);
  }

  /**
   * @dev Returns the name of the token.
   * @return The name of the token.
   */
  function name() public view returns (string memory) {
    return Token.getName();
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   * @return The symbol of the token.
   */
  function symbol() public view returns (string memory) {
    return Token.getSymbol();
  }

  /**
   * @dev Returns the decimals of the token.
   * @return The number of decimals of the token.
   */
  function decimals() public view returns (uint8) {
    return Token.getDecimals();
  }

  /**
   * @dev Returns the total supply of the token.
   * @return The total supply of the token.
   */
  function totalSupply() public view returns (uint256) {
    return Token.getTotalSupply();
  }

  /**
   * @dev Returns the balance of the `account`.
   * @param account The address of the account to get the balance of.
   * @return The balance of the `account`.
   */
  function balanceOf(address account) public view returns (uint256) {
    return Balances.get(account);
  }

  /**
   * @dev Returns the allowance of `spender` for `owner`.
   * @param owner The address of the owner.
   * @param spender The address of the spender.
   */
  function allowance(address owner, address spender) public view returns (uint256) {
    return Allowances.get(owner, spender);
  }
}
