// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import "../../../System.sol";
import "./interfaces/IERC721.sol";
import { IBaseWorld } from "../../../interfaces/IBaseWorld.sol";
import { BalanceTable } from "../common/BalanceTable.sol";
import { AllowanceTable } from "../common/AllowanceTable.sol";
import { MetadataTable } from "../common/MetadataTable.sol";
import { ERC721Table } from "./ERC721Table.sol";

import { ERC721Proxy } from "./ERC721Proxy.sol";
import { IERC721Receiver } from "./interfaces/IERC721Receiver.sol";
import { nameToBytes16, tokenToTable, Token } from "../common/utils.sol";
import { METADATA_T, ERC721_T, BALANCE_T, ALLOWANCE_T } from "../common/constants.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";

contract ERC721System is System {
  function from(bytes16 namespace, bytes16 _name) internal pure returns (bytes32) {
    return ResourceSelector.from(namespace, _name);
  }

  function balanceOf(bytes16 namespace, address owner) public view returns (uint256) {
    require(owner != address(0), "ERC721: address zero is not a valid owner");
    return BalanceTable.get(from(namespace, BALANCE_T), owner);
  }

  function ownerOf(bytes16 namespace, uint256 _tokenId) public view returns (address) {
    address owner = _ownerOf(namespace, _tokenId);
    require(owner != address(0), "ERC721: invalid token ID");
    return owner;
  }

  function proxy(bytes16 namespace) public view virtual returns (address) {
    return MetadataTable.getProxy(from(namespace, METADATA_T));
  }

  function totalSupply(bytes16 namespace) public view returns (uint256) {
    return MetadataTable.getTotalSupply(from(namespace, METADATA_T));
  }

  function name(bytes16 namespace) public view returns (string memory) {
    return MetadataTable.getName(from(namespace, METADATA_T));
  }

  function symbol(bytes16 namespace) public view returns (string memory) {
    return MetadataTable.getSymbol(from(namespace, METADATA_T));
  }

  function getAddress() public view returns (address) {
    return address(this);
  }

  function tokenURI(bytes16 namespace, uint256 tokenId) public view returns (string memory) {
    _requireMinted(namespace, tokenId);

    string memory _tokenURI = ERC721Table.getUri(from(namespace, ERC721_T), tokenId);

    if (bytes(_tokenURI).length > 0) {
      return _tokenURI;
    }
    return "";
  }

  function approve(bytes16 namespace, address to, uint256 tokenId) public {
    address owner = ownerOf(namespace, tokenId);
    require(to != owner, "ERC721: approval to current owner");

    require(
      _msgSender() == owner || isApprovedForAll(namespace, owner, _msgSender()),
      "ERC721: approve caller is not token owner or approved for all"
    );

    _approve(namespace, to, tokenId);
  }

  function getApproved(bytes16 namespace, uint256 tokenId) public view returns (address) {
    _requireMinted(namespace, tokenId);

    return ERC721Table.getTokenApproval(from(namespace, ERC721_T), tokenId);
  }

  function setApprovalForAll(bytes16 namespace, address operator, bool approved) public {
    _setApprovalForAll(namespace, _msgSender(), operator, approved);
  }

  function isApprovedForAll(bytes16 namespace, address owner, address operator) public view returns (bool) {
    return AllowanceTable.get(from(namespace, ALLOWANCE_T), owner, operator) != 0;
  }

  function transferFrom(bytes16 namespace, address _from, address to, uint256 tokenId) public {
    //solhint-disable-next-line max-line-length
    require(_isApprovedOrOwner(namespace, _msgSender(), tokenId), "ERC721: caller is not token owner or approved");

    _transfer(namespace, _from, to, tokenId);
  }

  function safeTransferFrom(bytes16 namespace, address _from, address to, uint256 tokenId) public {
    safeTransferFromWithData(namespace, _from, to, tokenId, "");
  }

  function safeTransferFromWithData(
    bytes16 namespace,
    address _from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) public {
    require(_isApprovedOrOwner(namespace, _msgSender(), tokenId), "ERC721: caller is not token owner or approved");
    _safeTransfer(namespace, _from, to, tokenId, data);
  }

  function _safeTransfer(
    bytes16 namespace,
    address _from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) internal virtual {
    _transfer(namespace, _from, to, tokenId);
    require(_checkOnERC721Received(_from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
  }

  function _ownerOf(bytes16 namespace, uint256 tokenId) internal view virtual returns (address) {
    return ERC721Table.getOwner(from(namespace, ERC721_T), tokenId);
  }

  function _exists(bytes16 namespace, uint256 tokenId) internal view virtual returns (bool) {
    return _ownerOf(namespace, tokenId) != address(0);
  }

  function _setTokenURI(bytes16 namespace, uint256 tokenId, string memory _tokenURI) internal virtual {
    require(_exists(namespace, tokenId), "ERC721URIStorage: URI set of nonexistent token");
    ERC721Table.setUri(from(namespace, ERC721_T), tokenId, _tokenURI);
  }

  function _isApprovedOrOwner(
    bytes16 namespace,
    address spender,
    uint256 tokenId
  ) internal view virtual returns (bool) {
    address owner = ownerOf(namespace, tokenId);
    return (spender == owner ||
      isApprovedForAll(namespace, owner, spender) ||
      getApproved(namespace, tokenId) == spender);
  }

  function _safeMint(bytes16 namespace, address to, uint256 tokenId) internal virtual {
    _safeMint(namespace, to, tokenId, "");
  }

  function _safeMint(bytes16 namespace, address to, uint256 tokenId, bytes memory data) internal virtual {
    _mint(namespace, to, tokenId);
    require(
      _checkOnERC721Received(address(0), to, tokenId, data),
      "ERC721: transfer to non ERC721Receiver implementer"
    );
  }

  function _mint(bytes16 namespace, address to, uint256 tokenId) internal virtual {
    require(to != address(0), "ERC721: mint to the zero address");
    require(!_exists(namespace, tokenId), "ERC721: token already minted");

    uint256 balance = BalanceTable.get(from(namespace, BALANCE_T), to);
    BalanceTable.set(from(namespace, BALANCE_T), to, balance + 1);

    uint256 _totalSupply = MetadataTable.getTotalSupply(from(namespace, METADATA_T));
    MetadataTable.setTotalSupply(from(namespace, METADATA_T), _totalSupply + 1);

    ERC721Table.setOwner(from(namespace, ERC721_T), tokenId, to);
    emitTransfer(namespace, address(0), to, tokenId);
  }

  function _burn(bytes16 namespace, uint256 tokenId) internal virtual {
    address owner = ownerOf(namespace, tokenId);

    // Clear approvals
    ERC721Table.setTokenApproval(from(namespace, ERC721_T), tokenId, address(0));
    uint256 balance = BalanceTable.get(from(namespace, BALANCE_T), owner);
    BalanceTable.set(from(namespace, BALANCE_T), owner, balance - 1);

    uint256 _totalSupply = MetadataTable.getTotalSupply(from(namespace, METADATA_T));
    require(_totalSupply > 0, "ERC721: no tokens to burn");
    MetadataTable.setTotalSupply(from(namespace, BALANCE_T), _totalSupply - 1);
    ERC721Table.setOwner(from(namespace, ERC721_T), tokenId, address(0));

    // emitTransfer(namespace, owner, address(0), tokenId);
  }

  function _transfer(bytes16 namespace, address _from, address to, uint256 tokenId) internal virtual {
    require(ownerOf(namespace, tokenId) == _from, "ERC721: transfer from incorrect owner");
    require(to != address(0), "ERC721: transfer to the zero address");

    ERC721Table.setTokenApproval(from(namespace, ERC721_T), tokenId, address(0));
    uint256 balance = BalanceTable.get(from(namespace, BALANCE_T), _from);
    BalanceTable.set(from(namespace, BALANCE_T), _from, balance - 1);

    balance = BalanceTable.get(from(namespace, BALANCE_T), to);
    BalanceTable.set(from(namespace, BALANCE_T), to, balance + 1);

    ERC721Table.setOwner(from(namespace, ERC721_T), tokenId, to);

    emitTransfer(namespace, _from, to, tokenId);
  }

  function _approve(bytes16 namespace, address to, uint256 tokenId) internal virtual {
    ERC721Table.setTokenApproval(from(namespace, ERC721_T), tokenId, to);
    emitApproval(namespace, ownerOf(namespace, tokenId), to, tokenId);
  }

  function _setApprovalForAll(bytes16 namespace, address owner, address operator, bool approved) internal virtual {
    require(owner != operator, "ERC721: approve to caller");
    AllowanceTable.set(from(namespace, ALLOWANCE_T), owner, operator, approved ? 1 : 0);
    // emitApprovalForAll(namespace, owner,operator, approved);
  }

  function _requireMinted(bytes16 namespace, uint256 tokenId) internal view virtual {
    require(_exists(namespace, tokenId), "ERC721: invalid token ID");
  }

  function _checkOnERC721Received(
    address _from,
    address to,
    uint256 tokenId,
    bytes memory data
  ) private returns (bool) {
    if (to.code.length > 0) {
      try IERC721Receiver(to).onERC721Received(_msgSender(), _from, tokenId, data) returns (bytes4 retval) {
        return retval == IERC721Receiver.onERC721Received.selector;
      } catch (bytes memory reason) {
        if (reason.length == 0) {
          revert("ERC721: transfer to non ERC721Receiver implementer");
        } else {
          /// @solidity memory-safe-assembly
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    } else {
      return true;
    }
  }

  function unsafe_increase_balance(bytes16 namespace, address account, uint256 amount) internal virtual {
    uint256 balance = BalanceTable.get(from(namespace, BALANCE_T), account);
    BalanceTable.set(from(namespace, BALANCE_T), account, balance + amount);
  }

  function emitTransfer(bytes16 namespace, address _from, address to, uint256 amount) internal {
    ERC721Proxy(proxy(namespace)).emitTransfer(_from, to, amount);
  }

  function emitApproval(bytes16 namespace, address _from, address to, uint256 amount) internal {
    ERC721Proxy(proxy(namespace)).emitApproval(_from, to, amount);
  }

  function emitApprovalForAll(bytes16 namespace, address _from, address to, bool approved) internal {
    ERC721Proxy(proxy(namespace)).emitApprovalForAll(_from, to, approved);
  }
}
