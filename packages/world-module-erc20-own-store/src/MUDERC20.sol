// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20Errors } from "./IERC20Errors.sol";
import { IERC20Events } from "./IERC20Events.sol";
import { Token } from "./codegen/tables/Token.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { Allowances } from "./codegen/tables/Allowances.sol";

import { Store } from "@latticexyz/store/src/Store.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { IStoreHook } from "@latticexyz/store/src/IStoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";

/**
 * @title ERC20 Module with own Store
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Implementation of EIP-20 that has on instance of `Store` which enables built in indexing and storage packing.
 */
contract MUDERC20 is Store, IERC20Errors, IERC20Events {
  constructor(string memory _name, string memory _symbol, uint8 _decimals) {
    StoreCore.initialize();
    StoreCore.registerInternalTables();

    Token.register();
    Balances.register();
    Allowances.register();

    Token.set(_decimals, 0, _name, _symbol);
  }

  /**
   * @dev Returns the name of the token.
   * @return The name of the token.
   */
  function name() public view returns (string memory) {
    return Token.getName();
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   * @return The symbol of the token.
   */
  function symbol() public view returns (string memory) {
    return Token.getSymbol();
  }

  /**
   * @dev Returns the decimals of the token.
   * @return The number of decimals of the token.
   */
  function decimals() public view returns (uint8) {
    return Token.getDecimals();
  }

  /**
   * @dev Returns the total supply of the token.
   * @return The total supply of the token.
   */
  function totalSupply() public view returns (uint256) {
    return Token.getTotalSupply();
  }

  /**
   * @dev Returns the balance of the `account`.
   * @param account The address of the account to get the balance of.
   * @return The balance of the `account`.
   */
  function balanceOf(address account) public view returns (uint256) {
    return Balances.get(account);
  }

  /**
   * @dev Returns the allowance of `spender` for `owner`.
   * @param owner The address of the owner.
   * @param spender The address of the spender.
   */
  function allowance(address owner, address spender) public view returns (uint256) {
    return Allowances.get(owner, spender);
  }

  /**
   * ToDo: Natspec
   */
  function transfer(address to, uint256 value) public returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
  }

  /**
   * ToDo: Natspec
   */
  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    _spendAllowance(from, msg.sender, value);
    _transfer(from, to, value);
    return true;
  }

  /**
   * @dev Moves a `value` amount of tokens from `from` to `to`.
   *
   * This internal function is equivalent to {transfer}, and can be used to
   * e.g. implement automatic token fees, slashing mechanisms, etc.
   *
   * Emits a {Transfer} event.
   *
   * NOTE: This function is not virtual, {_update} should be overridden instead.
   */
  function _transfer(address from, address to, uint256 value) internal {
    if (from == address(0)) {
      revert ERC20InvalidSender(address(0));
    }
    if (to == address(0)) {
      revert ERC20InvalidReceiver(address(0));
    }
    _update(from, to, value);
  }

  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   * Relies on the `_update` mechanism
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   *
   */
  function _mint(address account, uint256 value) internal {
    if (account == address(0)) {
        revert ERC20InvalidReceiver(address(0));
    }
    _update(address(0), account, value);
  }


  /**
   * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
   * Relies on the `_update` mechanism.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   *
   */
  function _burn(address account, uint256 value) internal {
    if (account == address(0)) {
        revert ERC20InvalidSender(address(0));
    }
    _update(account, address(0), value);
  }

  /**
   * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
   * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
   * this function.
   *
   * Emits a {Transfer} event.
   */
  function _update(address from, address to, uint256 value) internal {
    if (from == address(0)) {
      // Overflow check required: The rest of the code assumes that totalSupply never overflows
      Token.setTotalSupply(Token.getTotalSupply() + value);
    } else {
      uint256 fromBalance = Balances.get(from);
      if (fromBalance < value) {
        revert ERC20InsufficientBalance(from, fromBalance, value);
      }
      unchecked {
        // Overflow not possible: value <= fromBalance <= totalSupply.
        Balances.setBalance(from, fromBalance - value);
      }

      if (to == address(0)) {
        unchecked {
          // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
          Token.setTotalSupply(Token.getTotalSupply() + value);
        }
      } else {
        unchecked {
          // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
          uint256 balancePrior = Balances.get(to);
          Balances.setBalance(to, balancePrior - value);
        }

        emit Transfer(from, to, value);
      }
    }
  }

  /**
   * ToDo: Natspec
   */
  function approve(address spender, uint256 value) public returns (bool) {
    _approve(msg.sender, spender, value);
    return true;
  }

  /**
   * @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens.
   *
   * This internal function is equivalent to `approve`, and can be used to
   * e.g. set automatic allowances for certain subsystems, etc.
   *
   * Emits an {Approval} event.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   *
   */
  function _approve(address owner, address spender, uint256 value) internal {
    _approve(owner, spender, value, true);
  }

  /**
   * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
   *
   * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
   * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
   * `Approval` event during `transferFrom` operations.
   *
   *
   * Requirements are the same as {_approve}.
   */
  function _approve(address owner, address spender, uint256 value, bool emitEvent) internal {
    if (owner == address(0)) {
      revert ERC20InvalidApprover(address(0));
    }
    if (spender == address(0)) {
      revert ERC20InvalidSpender(address(0));
    }
    Allowances.setAllowance(owner, spender, value);
    if (emitEvent) {
      emit Approval(owner, spender, value);
    }
  }

  /**
   * @dev Updates `owner` s allowance for `spender` based on spent `value`.
   *
   * Does not update the allowance value in case of infinite allowance.
   * Revert if not enough allowance is available.
   *
   * Does not emit an {Approval} event.
   */
  function _spendAllowance(address owner, address spender, uint256 value) internal {
    uint256 currentAllowance = Allowances.getAllowance(owner, spender);
    if (currentAllowance != type(uint256).max) {
      if (currentAllowance < value) {
        revert ERC20InsufficientAllowance(spender, currentAllowance, value);
      }
      unchecked {
        _approve(owner, spender, currentAllowance - value, false);
      }
    }
  }

  // Set full record (including full dynamic data)
  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    EncodedLengths encodedLengths,
    bytes calldata dynamicData
  ) public {
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  // Splice data in the static part of the record
  function spliceStaticData(ResourceId tableId, bytes32[] calldata keyTuple, uint48 start, bytes calldata data) public {
    StoreCore.spliceStaticData(tableId, keyTuple, start, data);
  }

  // Splice data in the dynamic part of the record
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public {
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  // Set partial data at field index
  function setField(ResourceId tableId, bytes32[] calldata keyTuple, uint8 fieldIndex, bytes calldata data) public {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Set partial data at field index
  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Set partial data at dynamic field index
  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public {
    StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  // Push encoded items to the dynamic field at field index
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public {
    StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  // Pop byte length from the dynamic field at field index
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public {
    StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) public {
    StoreCore.deleteRecord(tableId, keyTuple);
  }

  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public {
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public {
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) public {
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
