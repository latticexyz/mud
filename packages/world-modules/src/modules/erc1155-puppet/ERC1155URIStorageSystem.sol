// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC1155/extensions/ERC1155URIStorage.sol)

pragma solidity ^0.8.20;

import { ERC1155System } from "./ERC1155System.sol";

import { Metadata } from "../tokens/tables/Metadata.sol";
import { TokenURI } from "../tokens/tables/TokenURI.sol";

import { _tokenUriTableId, _metadataTableId } from "./utils.sol";

/**
 * @dev ERC1155 token with storage based token URI management.
 * Inspired by the ERC721URIStorage extension
 * To use this extension, you need to replace ERC1155System occurences in ERC1155Module by this system's name instead
 * TODO: There are no unit tests presents for this URI Storage extension, and setters need to be manually set to
 * "public" visibility. /!\ Use at  your own risk /!\
 */
contract ERC1155URIStorageSystem is ERC1155System {
  /**
   * @dev See {IERC1155MetadataURI-uri}.
   *
   * This implementation returns the concatenation of the `_baseURI`
   * and the token-specific uri if the latter is set
   *
   * This enables the following behaviors:
   *
   * - if `_tokenURIs[tokenId]` is set, then the result is the concatenation
   *   of `_baseURI` and `_tokenURIs[tokenId]` (keep in mind that `_baseURI`
   *   is empty per default);
   *
   * - if `_tokenURIs[tokenId]` is NOT set then we fallback to `super.uri()`
   *   which in most cases will contain `ERC1155._uri`;
   *
   * - if `_tokenURIs[tokenId]` is NOT set, and if the parents do not have a
   *   uri value set, then the result is empty.
   */
  function uri(uint256 tokenId) public view virtual override returns (string memory) {
    string memory tokenURI = TokenURI.get(_tokenUriTableId(_namespace()), tokenId);

    // If token URI is set, concatenate base URI and tokenURI (via string.concat).
    return
      bytes(tokenURI).length > 0
        ? string.concat(Metadata.getBaseURI(_metadataTableId(_namespace())), tokenURI)
        : super.uri(tokenId);
  }

  /**
   * @dev Sets `tokenURI` as the tokenURI of `tokenId`.
   */
  function _setURI(uint256 tokenId, string memory tokenURI) internal virtual {
    TokenURI.set(_tokenUriTableId(_namespace()), tokenId, tokenURI);
    emit URI(uri(tokenId), tokenId);
  }

  /**
   * @dev Sets `baseURI` as the `_baseURI` for all tokens
   */
  function _setBaseURI(string memory baseURI) internal virtual {
    Metadata.setBaseURI(_metadataTableId(_namespace()), baseURI);
  }
}
