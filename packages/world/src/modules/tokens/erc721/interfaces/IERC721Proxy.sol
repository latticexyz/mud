// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC721.sol";
import "./IERC721Metadata.sol";

interface IERC721Proxy is IERC721, IERC721Metadata {
  function emitTransfer(address from, address to, uint256 tokenId) external;

  function emitApproval(address owner, address approved, uint256 tokenId) external;

  function emitApprovalForAll(address owner, address operator, bool approved) external;
}
