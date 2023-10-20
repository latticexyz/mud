// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/draft-IERC6093.sol)
pragma solidity >=0.8.21;

/**
 * @dev Standard ERC721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC721 tokens.
 */
interface IERC721Errors {
  /**
   * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in EIP-20.
   * Used in balance queries.
   * @param owner Address of the current owner of a token.
   */
  error ERC721InvalidOwner(address owner);

  /**
   * @dev Indicates a `tokenId` whose `owner` is the zero address.
   * @param tokenId Identifier number of a token.
   */
  error ERC721NonexistentToken(uint256 tokenId);

  /**
   * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
   * @param sender Address whose tokens are being transferred.
   * @param tokenId Identifier number of a token.
   * @param owner Address of the current owner of a token.
   */
  error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

  /**
   * @dev Indicates a failure with the token `sender`. Used in transfers.
   * @param sender Address whose tokens are being transferred.
   */
  error ERC721InvalidSender(address sender);

  /**
   * @dev Indicates a failure with the token `receiver`. Used in transfers.
   * @param receiver Address to which tokens are being transferred.
   */
  error ERC721InvalidReceiver(address receiver);

  /**
   * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
   * @param operator Address that may be allowed to operate on tokens without being their owner.
   * @param tokenId Identifier number of a token.
   */
  error ERC721InsufficientApproval(address operator, uint256 tokenId);

  /**
   * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
   * @param approver Address initiating an approval operation.
   */
  error ERC721InvalidApprover(address approver);

  /**
   * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
   * @param operator Address that may be allowed to operate on tokens without being their owner.
   */
  error ERC721InvalidOperator(address operator);
}
