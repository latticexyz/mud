// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Create2 } from "./vendor/Create2.sol";
import { IStore } from "./IStore.sol";
import { EncodedLengths } from "./EncodedLengths.sol";
import { ResourceId } from "./ResourceId.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { StoreCore } from "./StoreCore.sol";

contract StoreProxy {
  address public store;
  bytes[] private calls;

  constructor(address _store) {
    store = _store;
  }

  function _calls() public view returns (bytes[] memory) {
    return calls;
  }

  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    EncodedLengths encodedLengths,
    bytes calldata dynamicData
  ) public {
    calls.push(msg.data);
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  function spliceStaticData(ResourceId tableId, bytes32[] calldata keyTuple, uint48 start, bytes calldata data) public {
    calls.push(msg.data);
    StoreCore.spliceStaticData(tableId, keyTuple, start, data);
  }

  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public {
    calls.push(msg.data);
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  function setField(ResourceId tableId, bytes32[] calldata keyTuple, uint8 fieldIndex, bytes calldata data) public {
    calls.push(msg.data);
    StoreCore.setField(tableId, keyTuple, fieldIndex, data);
  }

  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    calls.push(msg.data);
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    calls.push(msg.data);
    StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public {
    calls.push(msg.data);
    StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public {
    calls.push(msg.data);
    StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public {
    calls.push(msg.data);
    StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  function deleteRecord(ResourceId tableId, bytes32[] calldata keyTuple) public {
    calls.push(msg.data);
    StoreCore.deleteRecord(tableId, keyTuple);
  }

  fallback() external payable {
    calls.push(msg.data);
    (bool success, bytes memory result) = store.call(msg.data);
    if (!success) {
      assembly {
        let returndata_size := mload(result)
        revert(add(result, 0x20), returndata_size)
      }
    }
    assembly {
      return(add(result, 0x20), mload(result))
    }
  }

  receive() external payable {
    (bool success, bytes memory result) = store.call{ value: msg.value }("");
    if (!success) {
      assembly {
        let returndata_size := mload(result)
        revert(add(result, 0x20), returndata_size)
      }
    }
  }
}

contract StoreSimulator {
  error CallResult(bool success, bytes data, bytes[] calls);

  function getProxyAddress(address store) public view returns (address) {
    return Create2.computeAddress(0, keccak256(_getBytecode(store)));
  }

  function call(address store, bytes calldata callData) external {
    address proxy = Create2.deploy(0, 0, _getBytecode(store));
    (bool success, bytes memory data) = proxy.call(callData);
    revert CallResult(success, data, StoreProxy(payable(proxy))._calls());
  }

  function _getBytecode(address store) internal pure returns (bytes memory) {
    return abi.encodePacked(type(StoreProxy).creationCode, abi.encode(store));
  }
}
