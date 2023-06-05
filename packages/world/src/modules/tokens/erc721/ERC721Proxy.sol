// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IERC721Proxy.sol";
import "./interfaces/IERC721Receiver.sol";
import { IBaseWorld } from "../../../interfaces/IBaseWorld.sol";
import { ERC721System } from "./ERC721System.sol";
import { BalanceTable } from "../common/BalanceTable.sol";
import { AllowanceTable } from "../common/AllowanceTable.sol";
import { MetadataTable } from "../common/MetadataTable.sol";
import { ERC721Table } from "./ERC721Table.sol";
import "../common/ERC165.sol";

import { tokenToTable, Token, nameToBytes16 } from "../common/utils.sol";
import { ERC721_T, ERC721_S, BALANCE_T, METADATA_T, ALLOWANCE_T } from "../common/constants.sol";

contract ERC721Proxy is IERC721Proxy {
  IBaseWorld private world;
  bytes32 private immutable balanceTableId;
  bytes32 private immutable metadataTableId;
  bytes32 private immutable allowanceTableId;
  bytes32 private immutable erc721TableId;

  constructor(IBaseWorld _world, string memory _name) {
    world = _world;
    balanceTableId = tokenToTable(_name, BALANCE_T);
    metadataTableId = tokenToTable(_name, METADATA_T);
    allowanceTableId = tokenToTable(_name, ALLOWANCE_T);
    erc721TableId = tokenToTable(_name, ERC721_T);
  }

  modifier onlySystemOrWorld() {
    bytes memory rawSystemAddress = world.call(
      nameToBytes16(name()),
      ERC721_S,
      abi.encodeWithSelector(ERC721System.getAddress.selector)
    );
    require(
      msg.sender == address(world) || msg.sender == abi.decode(rawSystemAddress, (address)),
      "ERC20: Only World or MUD token can emit approval event"
    );
    _;
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165) returns (bool) {
    return interfaceId == type(IERC721).interfaceId || interfaceId == type(IERC721Metadata).interfaceId;
  }

  function totalSupply() public view virtual returns (uint256) {
    return MetadataTable.getTotalSupply(world, metadataTableId);
  }

  /**
   * @dev See {IERC721-balanceOf}.
   */
  function balanceOf(address owner) public view virtual override returns (uint256) {
    return BalanceTable.get(world, balanceTableId, owner);
  }

  /**
   * @dev See {IERC721-ownerOf}.
   */
  function ownerOf(uint256 tokenId) public view virtual override returns (address) {
    return ERC721Table.getOwner(world, erc721TableId, tokenId);
  }

  /**
   * @dev See {IERC721Metadata-name}.
   */
  function name() public view virtual override returns (string memory) {
    return MetadataTable.getName(world, metadataTableId);
  }

  /**
   * @dev See {IERC721Metadata-symbol}.
   */
  function symbol() public view virtual override returns (string memory) {
    return MetadataTable.getSymbol(world, metadataTableId);
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    return ERC721Table.getUri(world, erc721TableId, tokenId);
  }

  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
    ERC721Table.setUri(world, erc721TableId, tokenId, _tokenURI);
  }

  /**
   * @dev See {IERC721-approve}.
   */
  function approve(address to, uint256 tokenId) public virtual override {
    _approve(to, tokenId);
  }

  /**
   * @dev See {IERC721-getApproved}.
   */
  function getApproved(uint256 tokenId) public view virtual override returns (address) {
    return ERC721Table.getTokenApproval(world, erc721TableId, tokenId);
  }

  /**
   * @dev See {IERC721-setApprovalForAll}.
   */
  function setApprovalForAll(address operator, bool approved) public virtual override {
    _setApprovalForAll(msg.sender, operator, approved);
  }

  /**
   * @dev See {IERC721-isApprovedForAll}.
   */
  function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
    return AllowanceTable.get(world, allowanceTableId, owner, operator) != 0;
  }

  /**
   * @dev See {IERC721-transferFrom}.
   */
  function transferFrom(address from, address to, uint256 tokenId) public virtual override {
    _transfer(from, to, tokenId);
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
    safeTransferFrom(from, to, tokenId, "");
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
    _safeTransfer(from, to, tokenId, data);
  }

  function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal virtual {
    _transfer(from, to, tokenId);
  }

  function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
    return ERC721Table.getOwner(world, erc721TableId, tokenId);
  }

  function _exists(uint256 tokenId) internal view virtual returns (bool) {
    return _ownerOf(tokenId) != address(0);
  }

  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
    address owner = _ownerOf(tokenId);
    return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
  }

  function _safeMint(address to, uint256 tokenId) internal virtual {
    _safeMint(to, tokenId, "");
  }

  function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual {
    _mint(to, tokenId);
  }

  function _mint(address to, uint256 tokenId) internal virtual {
    require(to != address(0), "ERC721: mint to the zero address");
    require(!_exists(tokenId), "ERC721: token already minted");

    uint256 balance = BalanceTable.get(world, balanceTableId, to);
    BalanceTable.set(world, balanceTableId, to, balance + 1);

    uint256 _totalSupply = MetadataTable.getTotalSupply(world, metadataTableId);
    MetadataTable.setTotalSupply(world, metadataTableId, _totalSupply + 1);

    ERC721Table.setOwner(world, erc721TableId, tokenId, to);

    emit Transfer(address(0), to, tokenId);
  }

  function _burn(uint256 tokenId) internal virtual {
    address owner = ownerOf(tokenId);

    // Clear approvals
    ERC721Table.setTokenApproval(world, erc721TableId, tokenId, address(0));
    uint256 balance = BalanceTable.get(world, balanceTableId, owner);
    BalanceTable.set(world, balanceTableId, owner, balance - 1);

    uint256 _totalSupply = MetadataTable.getTotalSupply(world, metadataTableId);
    require(_totalSupply > 0, "ERC721: no tokens to burn");
    MetadataTable.setTotalSupply(world, balanceTableId, _totalSupply - 1);
    ERC721Table.setOwner(world, erc721TableId, tokenId, address(0));

    emit Transfer(owner, address(0), tokenId);
  }

  function _transfer(address from, address to, uint256 tokenId) internal virtual {
    require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
    require(to != address(0), "ERC721: transfer to the zero address");

    ERC721Table.setTokenApproval(world, erc721TableId, tokenId, address(0));
    uint256 balance = BalanceTable.get(world, balanceTableId, from);
    BalanceTable.set(world, balanceTableId, from, balance - 1);

    balance = BalanceTable.get(world, balanceTableId, to);
    BalanceTable.set(world, balanceTableId, to, balance + 1);

    ERC721Table.setOwner(world, erc721TableId, tokenId, to);

    emit Transfer(from, to, tokenId);
  }

  /**
   * @dev Approve `to` to operate on `tokenId`
   *
   * Emits an {Approval} event.
   */
  function _approve(address to, uint256 tokenId) internal virtual {
    ERC721Table.setTokenApproval(world, erc721TableId, tokenId, to);
    emit Approval(ownerOf(tokenId), to, tokenId);
  }

  function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
    require(owner != operator, "ERC721: approve to caller");
    AllowanceTable.set(world, allowanceTableId, owner, operator, approved ? 1 : 0);
    emit ApprovalForAll(owner, operator, approved);
  }

  function _requireMinted(uint256 tokenId) internal view virtual {
    require(_exists(tokenId), "ERC721: invalid token ID");
  }

  function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) private returns (bool) {
    if (to.code.length > 0) {
      try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
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

  // solhint-disable-next-line func-name-mixedcase
  function unsafe_increase_balance(address account, uint256 amount) internal {
    uint256 balance = BalanceTable.get(world, balanceTableId, account);
    BalanceTable.set(world, balanceTableId, account, balance + amount);
  }

  function emitTransfer(address from, address to, uint256 tokenId) public onlySystemOrWorld {
    emit Transfer(from, to, tokenId);
  }

  /**
   * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
   */
  function emitApproval(address owner, address approved, uint256 tokenId) public onlySystemOrWorld {
    emit Approval(owner, approved, tokenId);
  }

  /**
   * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
   */
  function emitApprovalForAll(address owner, address operator, bool approved) public onlySystemOrWorld {
    emit ApprovalForAll(owner, operator, approved);
  }
}
