// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC1155/ERC1155.sol)

pragma solidity ^0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { SystemRegistry } from "@latticexyz/world/src/codegen/tables/SystemRegistry.sol";

import { AccessControlLib } from "../../utils/AccessControlLib.sol";
import { PuppetMaster } from "../puppet/PuppetMaster.sol";
import { toTopic } from "../puppet/utils.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { IERC1155 } from "./IERC1155.sol";
import { IERC1155Receiver } from "./IERC1155Receiver.sol";
import { IERC1155MetadataURI } from "./IERC1155Metadata.sol";
import { IERC1155Mintable } from "./IERC1155Mintable.sol";
import { IERC1155Errors } from "./IERC1155Errors.sol";
import { IERC1155Events } from "./IERC1155Events.sol";

import { ERC1155Balances } from "./tables/ERC1155Balances.sol";
import { TokenMetadata } from "../tokens/tables/TokenMetadata.sol";
import { TokenOperatorApproval } from "../tokens/tables/TokenOperatorApproval.sol";

import { _balancesTableId, _metadataTableId, _operatorApprovalTableId } from "./utils.sol";

/**
 * @dev Implementation of the basic standard multi-token.
 * See https://eips.ethereum.org/EIPS/eip-1155
 * Originally based on code by Enjin: https://github.com/enjin/erc-1155
 */
contract ERC1155System is IERC1155, IERC1155MetadataURI, IERC1155Mintable, System, PuppetMaster {
  using WorldResourceIdInstance for ResourceId;

  // constructor has been removed, since initialization is done during registration through ERC1155Module

  /**
   * @dev See {IERC165-supportsInterface}.
   */
  function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
    return
      interfaceId == type(IERC1155).interfaceId ||
      interfaceId == type(IERC1155MetadataURI).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /**
   * @dev See {IERC1155MetadataURI-uri}.
   *
   * This implementation returns the same URI for *all* token types. It relies
   * on the token type ID substitution mechanism
   * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the ERC].
   *
   * Clients calling this function must replace the `\{id\}` substring with the
   * actual token type ID.
   */
  function uri(uint256 /* id */) public view virtual returns (string memory) {
    return TokenMetadata.getBaseURI(_metadataTableId(_namespace()));
  }

  /**
   * @dev See {IERC1155-balanceOf}.
   */
  function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
    return ERC1155Balances.get(_balancesTableId(_namespace()), id, account);
  }

  /**
   * @dev See {IERC1155-balanceOfBatch}.
   *
   * Requirements:
   *
   * - `accounts` and `ids` must have the same length.
   */
  function balanceOfBatch(
    address[] memory accounts,
    uint256[] memory ids
  ) public view virtual returns (uint256[] memory) {
    if (accounts.length != ids.length) {
      revert ERC1155InvalidArrayLength(ids.length, accounts.length);
    }

    uint256[] memory batchBalances = new uint256[](accounts.length);

    for (uint256 i = 0; i < accounts.length; ++i) {
      batchBalances[i] = ERC1155Balances.get(_balancesTableId(_namespace()), ids[i], accounts[i]);
    }

    return batchBalances;
  }

  /**
   * @dev See {IERC1155-setApprovalForAll}.
   */
  function setApprovalForAll(address operator, bool approved) public virtual {
    _setApprovalForAll(_msgSender(), operator, approved);
  }

  /**
   * @dev See {IERC1155-isApprovedForAll}.
   */
  function isApprovedForAll(address account, address operator) public view virtual returns (bool) {
    return TokenOperatorApproval.get(_operatorApprovalTableId(_namespace()), account, operator);
  }

  /**
   * @dev See {IERC1155-safeTransferFrom}.
   */
  function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public virtual {
    address sender = _msgSender();
    if (from != sender && !isApprovedForAll(from, sender)) {
      revert ERC1155MissingApprovalForAll(sender, from);
    }
    _safeTransferFrom(from, to, id, value, data);
  }

  /**
   * @dev See {IERC1155-safeBatchTransferFrom}.
   */
  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) public virtual {
    address sender = _msgSender();
    if (from != sender && !isApprovedForAll(from, sender)) {
      revert ERC1155MissingApprovalForAll(sender, from);
    }
    _safeBatchTransferFrom(from, to, ids, values, data);
  }

  /**
   * @dev see {IERC1155Mintable-mint}.
   */
  function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
    _requireOwner();
    _mint(account, id, amount, data);
  }

  /**
   * @dev see {IERC1155Mintable-mintBatch}.
   */
  function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public {
    _requireOwner();
    _mintBatch(to, ids, amounts, data);
  }

  /**
   * @dev {IERC1155Burnable-burn}.
   */
  function burn(address account, uint256 id, uint256 value) public {
    _requireOwner();
    _burn(account, id, value);
  }

  /**
   * @dev {IERC1155Burnable-burnBatch}.
   */
  function burnBatch(address account, uint256[] memory ids, uint256[] memory values) public {
    _requireOwner();
    _burnBatch(account, ids, values);
  }

  /**
   * @dev Transfers a `value` amount of tokens of type `id` from `from` to `to`. Will mint (or burn) if `from`
   * (or `to`) is the zero address.
   *
   * Emits a {TransferSingle} event if the arrays contain one element, and {TransferBatch} otherwise.
   *
   * Requirements:
   *
   * - If `to` refers to a smart contract, it must implement either {IERC1155Receiver-onERC1155Received}
   *   or {IERC1155Receiver-onERC1155BatchReceived} and return the acceptance magic value.
   * - `ids` and `values` must have the same length.
   *
   * NOTE: The ERC-1155 acceptance check is not performed in this function. See {_updateWithAcceptanceCheck} instead.
   */
  function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual {
    if (ids.length != values.length) {
      revert ERC1155InvalidArrayLength(ids.length, values.length);
    }

    address operator = _msgSender();

    for (uint256 i = 0; i < ids.length; ++i) {
      uint256 id = ids[i];
      uint256 value = values[i];

      if (from != address(0)) {
        uint256 fromBalance = ERC1155Balances.get(_balancesTableId(_namespace()), id, from);
        if (fromBalance < value) {
          revert ERC1155InsufficientBalance(from, fromBalance, value, id);
        }
        ERC1155Balances.set(_balancesTableId(_namespace()), id, from, (fromBalance - value));
      }

      if (to != address(0)) {
        ERC1155Balances.set(
          _balancesTableId(_namespace()),
          id,
          to,
          ERC1155Balances.get(_balancesTableId(_namespace()), id, to) + value
        );
      }
    }

    if (ids.length == 1) {
      uint256 id = ids[0];
      uint256 value = values[0];
      puppet().log(TransferSingle.selector, toTopic(operator), toTopic(from), toTopic(to), abi.encode(id, value));
    } else {
      puppet().log(TransferBatch.selector, toTopic(operator), toTopic(from), toTopic(to), abi.encode(ids, values));
    }
  }

  /**
   * @dev Version of {_update} that performs the token acceptance check by calling
   * {IERC1155Receiver-onERC1155Received} or {IERC1155Receiver-onERC1155BatchReceived} on the receiver address if it
   * contains code (eg. is a smart contract at the moment of execution).
   *
   * IMPORTANT: Overriding this function is discouraged because it poses a reentrancy risk from the receiver. So any
   * update to the contract state after this function would break the check-effect-interaction pattern. Consider
   * overriding {_update} instead.
   */
  function _updateWithAcceptanceCheck(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) internal virtual {
    _update(from, to, ids, values);
    if (to != address(0)) {
      address operator = _msgSender();
      if (ids.length == 1) {
        uint256 id = ids[0];
        uint256 value = values[0];
        _doSafeTransferAcceptanceCheck(operator, from, to, id, value, data);
      } else {
        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, values, data);
      }
    }
  }

  /**
   * @dev Transfers a `value` tokens of token type `id` from `from` to `to`.
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - `from` must have a balance of tokens of type `id` of at least `value` amount.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
   * acceptance magic value.
   */
  function _safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) internal {
    if (to == address(0)) {
      revert ERC1155InvalidReceiver(address(0));
    }
    if (from == address(0)) {
      revert ERC1155InvalidSender(address(0));
    }
    (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
    _updateWithAcceptanceCheck(from, to, ids, values, data);
  }

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_safeTransferFrom}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
   * acceptance magic value.
   * - `ids` and `values` must have the same length.
   */
  function _safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) internal {
    if (to == address(0)) {
      revert ERC1155InvalidReceiver(address(0));
    }
    if (from == address(0)) {
      revert ERC1155InvalidSender(address(0));
    }
    _updateWithAcceptanceCheck(from, to, ids, values, data);
  }

  /**
   * @dev Sets a new URI for all token types, by relying on the token type ID
   * substitution mechanism
   * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the ERC].
   *
   * By this mechanism, any occurrence of the `\{id\}` substring in either the
   * URI or any of the values in the JSON file at said URI will be replaced by
   * clients with the token type ID.
   *
   * For example, the `https://token-cdn-domain/\{id\}.json` URI would be
   * interpreted by clients as
   * `https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
   * for token type ID 0x4cce0.
   *
   * See {uri}.
   *
   * Because these URIs cannot be meaningfully represented by the {URI} event,
   * this function emits no events.
   */
  function _setURI(string memory newuri) internal virtual {
    TokenMetadata.setBaseURI(_metadataTableId(_namespace()), newuri);
  }

  /**
   * @dev Creates a `value` amount of tokens of type `id`, and assigns them to `to`.
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
   * acceptance magic value.
   */
  function _mint(address to, uint256 id, uint256 value, bytes memory data) internal {
    if (to == address(0)) {
      revert ERC1155InvalidReceiver(address(0));
    }
    (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
    _updateWithAcceptanceCheck(address(0), to, ids, values, data);
  }

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - `ids` and `values` must have the same length.
   * - `to` cannot be the zero address.
   * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
   * acceptance magic value.
   */
  function _mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
    if (to == address(0)) {
      revert ERC1155InvalidReceiver(address(0));
    }
    _updateWithAcceptanceCheck(address(0), to, ids, values, data);
  }

  /**
   * @dev Destroys a `value` amount of tokens of type `id` from `from`
   *
   * Emits a {TransferSingle} event.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `from` must have at least `value` amount of tokens of type `id`.
   */
  function _burn(address from, uint256 id, uint256 value) internal {
    if (from == address(0)) {
      revert ERC1155InvalidSender(address(0));
    }
    (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
    _updateWithAcceptanceCheck(from, address(0), ids, values, "");
  }

  /**
   * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
   *
   * Emits a {TransferBatch} event.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `from` must have at least `value` amount of tokens of type `id`.
   * - `ids` and `values` must have the same length.
   */
  function _burnBatch(address from, uint256[] memory ids, uint256[] memory values) internal {
    if (from == address(0)) {
      revert ERC1155InvalidSender(address(0));
    }
    _updateWithAcceptanceCheck(from, address(0), ids, values, "");
  }

  /**
   * @dev Approve `operator` to operate on all of `owner` tokens
   *
   * Emits an {ApprovalForAll} event.
   *
   * Requirements:
   *
   * - `operator` cannot be the zero address.
   */
  function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
    if (operator == address(0)) {
      revert ERC1155InvalidOperator(address(0));
    }
    TokenOperatorApproval.set(_operatorApprovalTableId(_namespace()), owner, operator, approved);
    puppet().log(ApprovalForAll.selector, toTopic(owner), toTopic(operator), abi.encode(approved));
  }

  /**
   * @dev Performs an acceptance check by calling {IERC1155-onERC1155Received} on the `to` address
   * if it contains code at the moment of execution.
   */
  function _doSafeTransferAcceptanceCheck(
    address operator,
    address from,
    address to,
    uint256 id,
    uint256 value,
    bytes memory data
  ) private {
    if (to.code.length > 0) {
      try IERC1155Receiver(to).onERC1155Received(operator, from, id, value, data) returns (bytes4 response) {
        if (response != IERC1155Receiver.onERC1155Received.selector) {
          // Tokens rejected
          revert ERC1155InvalidReceiver(to);
        }
      } catch (bytes memory reason) {
        if (reason.length == 0) {
          // non-IERC1155Receiver implementer
          revert ERC1155InvalidReceiver(to);
        } else {
          /// @solidity memory-safe-assembly
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    }
  }

  /**
   * @dev Performs a batch acceptance check by calling {IERC1155-onERC1155BatchReceived} on the `to` address
   * if it contains code at the moment of execution.
   */
  function _doSafeBatchTransferAcceptanceCheck(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory values,
    bytes memory data
  ) private {
    if (to.code.length > 0) {
      try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, values, data) returns (bytes4 response) {
        if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
          // Tokens rejected
          revert ERC1155InvalidReceiver(to);
        }
      } catch (bytes memory reason) {
        if (reason.length == 0) {
          // non-IERC1155Receiver implementer
          revert ERC1155InvalidReceiver(to);
        } else {
          /// @solidity memory-safe-assembly
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    }
  }

  /**
   * @dev Creates an array in memory with only one value for each of the elements provided.
   */
  function _asSingletonArrays(
    uint256 element1,
    uint256 element2
  ) private pure returns (uint256[] memory array1, uint256[] memory array2) {
    /// @solidity memory-safe-assembly
    assembly {
      // Load the free memory pointer
      array1 := mload(0x40)
      // Set array length to 1
      mstore(array1, 1)
      // Store the single element at the next word after the length (where content starts)
      mstore(add(array1, 0x20), element1)

      // Repeat for next array locating it right after the first array
      array2 := add(array1, 0x40)
      mstore(array2, 1)
      mstore(add(array2, 0x20), element2)

      // Update the free memory pointer by pointing after the second array
      mstore(0x40, add(array2, 0x40))
    }
  }

  function _namespace() internal view returns (bytes14 namespace) {
    ResourceId systemId = SystemRegistry.get(address(this));
    return systemId.getNamespace();
  }

  function _requireOwner() internal view {
    AccessControlLib.requireOwner(SystemRegistry.get(address(this)), _msgSender());
  }
}
