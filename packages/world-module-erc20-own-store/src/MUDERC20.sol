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
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    bytes calldata data
  ) public virtual {
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
  ) public virtual {
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Set partial data at field index
  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Set partial data at dynamic field index
  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public virtual {
    StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  // Push encoded items to the dynamic field at field index
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public virtual {
    StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  // Pop byte length from the dynamic field at field index
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public virtual {
    StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) public virtual {
    StoreCore.deleteRecord(tableId, keyTuple);
  }

  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) public virtual {
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
