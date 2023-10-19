// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity >=0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

/**
 * @dev Extending the ERC20 standard with permissioned mint and burn functions.
 */
interface IERC20Mintable is IERC20, IERC20Metadata, IERC20Errors {
  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   */
  function mint(address account, uint256 value) external;

  /**
   * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   */
  function burn(address account, uint256 value) external;
}
