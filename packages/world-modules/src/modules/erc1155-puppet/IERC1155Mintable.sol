// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IERC1155 } from "./IERC1155.sol";

/**
 * @dev Extending the ERC1155 standard with permissioned mint and burn functions.
 */
interface IERC1155Mintable is IERC1155 {
  /**
   * @dev Mints `amount` of `id` tokens and transfers it to `account`.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function mint(address account, uint256 id, uint256 amount, bytes memory data) external;

  /**
   * @dev Batch-mints `amounts` of `ids` tokens and transfers it to `to`.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external;
}
