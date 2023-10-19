// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdInstance, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { SystemRegistry } from "@latticexyz/world/src/codegen/tables/SystemRegistry.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";

import { AccessControlLib } from "../../utils/AccessControlLib.sol";
import { PuppetMaster } from "../puppet/PuppetMaster.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { IERC721Mintable } from "./IERC721Mintable.sol";

import { ERC721Metadata } from "./tables/ERC721Metadata.sol";
import { OperatorApproval } from "./tables/OperatorApproval.sol";
import { Owners } from "./tables/Owners.sol";
import { TokenApproval } from "./tables/TokenApproval.sol";
import { TokenURI } from "./tables/TokenURI.sol";

import { _balancesTableId, _metadataTableId, _tokenUriTableId, _operatorApprovalTableId, _ownersTableId, _tokenApprovalTableId, _toBytes32 } from "./utils.sol";

/**
 * TODO:
 * - extend ERC721 to avoid having to redefine all the functions
 * - make `mint` and `burn` public with `requireOwner` check
 * - Fix up ERC721 Module
 * - Add ERC721 tests
 */

contract ERC721System is IERC721Mintable, System, PuppetMaster {
  using Strings for uint256;
  using WorldResourceIdInstance for ResourceId;

  /**
   *
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(WorldContextConsumer, IERC165) returns (bool) {
    return interfaceId == type(IERC721Mintable).interfaceId || super.supportsInterface(interfaceId);
  }

  /**
   * @dev See {IERC721-balanceOf}.
   */
  function balanceOf(address owner) public view virtual returns (uint256) {
    if (owner == address(0)) {
      revert ERC721InvalidOwner(address(0));
    }
    return Balances.get(_balancesTableId(_namespace()), owner);
  }

  /**
   * @dev See {IERC721-ownerOf}.
   */
  function ownerOf(uint256 tokenId) public view virtual returns (address) {
    return _requireOwned(tokenId);
  }

  /**
   * @dev See {IERC721Metadata-name}.
   */
  function name() public view virtual returns (string memory) {
    return ERC721Metadata.getName(_metadataTableId(_namespace()));
  }

  /**
   * @dev See {IERC721Metadata-symbol}.
   */
  function symbol() public view virtual returns (string memory) {
    return ERC721Metadata.getSymbol(_metadataTableId(_namespace()));
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
    _requireOwned(tokenId);

    string memory baseURI = _baseURI();
    string memory _tokenURI = TokenURI.get(_tokenUriTableId(_namespace()), tokenId);
    _tokenURI = bytes(_tokenURI).length > 0 ? _tokenURI : tokenId.toString();
    return bytes(baseURI).length > 0 ? string.concat(baseURI, _tokenURI) : _tokenURI;
  }

  /**
   * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
   * token will be the concatenation of the `baseURI` and the `tokenId`.
   */
  function _baseURI() internal view virtual returns (string memory) {
    return ERC721Metadata.getBaseURI(_metadataTableId(_namespace()));
  }

  /**
   * @dev See {IERC721-approve}.
   */
  function approve(address to, uint256 tokenId) public virtual {
    _approve(to, tokenId, _msgSender());
  }

  /**
   * @dev See {IERC721-getApproved}.
   */
  function getApproved(uint256 tokenId) public view virtual returns (address) {
    _requireOwned(tokenId);

    return _getApproved(tokenId);
  }

  /**
   * @dev See {IERC721-setApprovalForAll}.
   */
  function setApprovalForAll(address operator, bool approved) public virtual {
    _setApprovalForAll(_msgSender(), operator, approved);
  }

  /**
   * @dev See {IERC721-isApprovedForAll}.
   */
  function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
    return OperatorApproval.get(_operatorApprovalTableId(_namespace()), owner, operator);
  }

  /**
   * @dev See {IERC721-transferFrom}.
   */
  function transferFrom(address from, address to, uint256 tokenId) public virtual {
    if (to == address(0)) {
      revert ERC721InvalidReceiver(address(0));
    }
    // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
    // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
    address previousOwner = _update(to, tokenId, _msgSender());
    if (previousOwner != from) {
      revert ERC721IncorrectOwner(from, tokenId, previousOwner);
    }
  }

  /**
   * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
   *
   * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
   * core ERC721 logic MUST be matched with the use of {_increaseBalance} to keep balances
   * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
   * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
   */
  function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
    return Owners.get(_ownersTableId(_namespace()), tokenId);
  }

  /**
   * @dev Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted.
   */
  function _getApproved(uint256 tokenId) internal view virtual returns (address) {
    return TokenApproval.get(_tokenApprovalTableId(_namespace()), tokenId);
  }

  /**
   * @dev Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
   * particular (ignoring whether it is owned by `owner`).
   *
   * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
   * assumption.
   */
  function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool) {
    return
      spender != address(0) &&
      (owner == spender || isApprovedForAll(owner, spender) || _getApproved(tokenId) == spender);
  }

  /**
   * @dev Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
   * Reverts if `spender` does not have approval from the provided `owner` for the given token or for all its assets
   * the `spender` for the specific `tokenId`.
   *
   * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
   * assumption.
   */
  function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual {
    if (!_isAuthorized(owner, spender, tokenId)) {
      if (owner == address(0)) {
        revert ERC721NonexistentToken(tokenId);
      } else {
        revert ERC721InsufficientApproval(spender, tokenId);
      }
    }
  }

  /**
   * @dev Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.
   *
   * NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
   * a uint256 would ever overflow from increments when these increments are bounded to uint128 values.
   *
   * WARNING: Increasing an account's balance using this function tends to be paired with an override of the
   * {_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
   * remain consistent with one another.
   */
  function _increaseBalance(address account, uint128 value) internal virtual {
    ResourceId balanceTableId = _balancesTableId(_namespace());
    unchecked {
      Balances.set(balanceTableId, account, Balances.get(balanceTableId, account) + value);
    }
  }

  /**
   * @dev Transfers `tokenId` from its current owner to `to`, or alternatively mints (or burns) if the current owner
   * (or `to`) is the zero address. Returns the owner of the `tokenId` before the update.
   *
   * The `auth` argument is optional. If the value passed is non 0, then this function will check that
   * `auth` is either the owner of the token, or approved to operate on the token (by the owner).
   *
   * Emits a {Transfer} event.
   *
   * NOTE: If overriding this function in a way that tracks balances, see also {_increaseBalance}.
   */
  function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
    ResourceId balanceTableId = _balancesTableId(_namespace());
    address from = _ownerOf(tokenId);

    // Perform (optional) operator check
    if (auth != address(0)) {
      _checkAuthorized(from, auth, tokenId);
    }

    // Execute the update
    if (from != address(0)) {
      // Clear approval. No need to re-authorize or emit the Approval event
      _approve(address(0), tokenId, address(0), false);

      unchecked {
        Balances.set(balanceTableId, from, Balances.get(balanceTableId, from) - 1);
      }
    }

    if (to != address(0)) {
      unchecked {
        Balances.set(balanceTableId, from, Balances.get(balanceTableId, from) + 1);
      }
    }

    Owners.set(_ownersTableId(_namespace()), tokenId, to);

    emit Transfer(from, to, tokenId);

    return from;
  }

  /**
   * @dev Mints `tokenId` and transfers it to `to`.
   *
   * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
   *
   * Requirements:
   *
   * - `tokenId` must not exist.
   * - `to` cannot be the zero address.
   *
   * Emits a {Transfer} event.
   */
  function _mint(address to, uint256 tokenId) internal {
    if (to == address(0)) {
      revert ERC721InvalidReceiver(address(0));
    }
    address previousOwner = _update(to, tokenId, address(0));
    if (previousOwner != address(0)) {
      revert ERC721InvalidSender(address(0));
    }
  }

  /**
   * @dev Destroys `tokenId`.
   * The approval is cleared when the token is burned.
   * This is an internal function that does not check if the sender is authorized to operate on the token.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   *
   * Emits a {Transfer} event.
   */
  function _burn(uint256 tokenId) internal {
    address previousOwner = _update(address(0), tokenId, address(0));
    if (previousOwner == address(0)) {
      revert ERC721NonexistentToken(tokenId);
    }
  }

  /**
   * @dev Transfers `tokenId` from `from` to `to`.
   *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - `tokenId` token must be owned by `from`.
   *
   * Emits a {Transfer} event.
   */
  function _transfer(address from, address to, uint256 tokenId) internal {
    if (to == address(0)) {
      revert ERC721InvalidReceiver(address(0));
    }
    address previousOwner = _update(to, tokenId, address(0));
    if (previousOwner == address(0)) {
      revert ERC721NonexistentToken(tokenId);
    } else if (previousOwner != from) {
      revert ERC721IncorrectOwner(from, tokenId, previousOwner);
    }
  }

  /**
   * @dev Approve `to` to operate on `tokenId`
   *
   * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
   * either the owner of the token, or approved to operate on all tokens held by this owner.
   *
   * Emits an {Approval} event.
   *
   * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
   */
  function _approve(address to, uint256 tokenId, address auth) internal {
    _approve(to, tokenId, auth, true);
  }

  /**
   * @dev Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
   * emitted in the context of transfers.
   */
  function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual {
    // Avoid reading the owner unless necessary
    if (emitEvent || auth != address(0)) {
      address owner = _requireOwned(tokenId);

      // We do not use _isAuthorized because single-token approvals should not be able to call approve
      if (auth != address(0) && owner != auth && !isApprovedForAll(owner, auth)) {
        revert ERC721InvalidApprover(auth);
      }

      if (emitEvent) {
        emit Approval(owner, to, tokenId);
      }
    }

    TokenApproval.set(_tokenApprovalTableId(_namespace()), tokenId, to);
  }

  /**
   * @dev Approve `operator` to operate on all of `owner` tokens
   *
   * Requirements:
   * - operator can't be the address zero.
   *
   * Emits an {ApprovalForAll} event.
   */
  function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
    if (operator == address(0)) {
      revert ERC721InvalidOperator(operator);
    }
    OperatorApproval.set(_operatorApprovalTableId(_namespace()), owner, operator, approved);
    emit ApprovalForAll(owner, operator, approved);
  }

  /**
   * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
   * Returns the owner.
   *
   * Overrides to ownership logic should be done to {_ownerOf}.
   */
  function _requireOwned(uint256 tokenId) internal view returns (address) {
    address owner = _ownerOf(tokenId);
    if (owner == address(0)) {
      revert ERC721NonexistentToken(tokenId);
    }
    return owner;
  }

  function _namespace() internal view returns (bytes14 namespace) {
    ResourceId systemId = SystemRegistry.get(address(this));
    return systemId.getNamespace();
  }

  function _requireOwner() internal view {
    AccessControlLib.requireOwner(SystemRegistry.get(address(this)), _msgSender());
  }
}
