// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @dev Required ERC-1155 Events, as defined in the
 * https://eips.ethereum.org/EIPS/eip-1155[ERC].
 */
interface IERC1155Events {
  /**
   * @dev Emitted when `value` amount of tokens of type `id` are transferred from `from` to `to` by `operator`.
   */
  event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

  /**
   * @dev Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all
   * transfers.
   */
  event TransferBatch(
    address indexed operator,
    address indexed from,
    address indexed to,
    uint256[] ids,
    uint256[] values
  );

  /**
   * @dev Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to
   * `approved`.
   */
  event ApprovalForAll(address indexed account, address indexed operator, bool approved);

  /**
   * @dev Emitted when the URI for token type `id` changes to `value`, if it is a non-programmatic URI.
   *
   * If an {URI} event was emitted for `id`, the standard
   * https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions[guarantees] that `value` will equal the value
   * returned by {IERC1155MetadataURI-uri}.
   */
  event URI(string value, uint256 indexed id);
}
