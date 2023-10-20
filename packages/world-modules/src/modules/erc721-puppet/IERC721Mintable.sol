// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)
pragma solidity >=0.8.21;

import { IERC721 } from "./IERC721.sol";

/**
 * @dev Extending the ERC721 standard with permissioned mint and burn functions.
 */
interface IERC721Mintable is IERC721 {
  /**
   * @dev Mints `tokenId` and transfers it to `to`.
   *
   * Requirements:
   *
   * - `tokenId` must not exist.
   * - `to` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function mint(address to, uint256 tokenId) external;

  /**
   * @dev Destroys `tokenId`.
   * The approval is cleared when the token is burned.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   *
   * Emits a {Transfer} event.
   */
  function burn(uint256 tokenId) external;
}
