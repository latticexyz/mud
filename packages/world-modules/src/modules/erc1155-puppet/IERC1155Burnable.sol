// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC1155/extensions/ERC1155Burnable.sol)

pragma solidity ^0.8.20;

import { IERC1155 } from "./IERC1155.sol";

/**
 * @dev Extension of {ERC1155} that allows token holders to destroy both their
 * own tokens and those that they have been approved to use.
 */
interface IERC1155Burnable is IERC1155 {
  /**
   * @dev Burns `value` of `id` tokens that belonged to `account`.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function burn(address account, uint256 id, uint256 value) external;

  /**
   * @dev Burns `values` of `ids` tokens that belonged to `account`.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function burnBatch(address account, uint256[] memory ids, uint256[] memory values) external;
}
