// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { StoreCore } from "./StoreCore.sol";
import { StoreView } from "./StoreView.sol";
import { SchemaType, ExecutionMode } from "./Types.sol";
import { RouteTable, Route, id as RouteId } from "./tables/RouteTable.sol";
import { Bytes } from "./Bytes.sol";

/**
 * TODO: add access control
 */
contract World is StoreView {
  error World_InvalidSystem();

  constructor() {
    registerSchema(RouteId, RouteTable.getSchema());
  }

  function registerSchema(bytes32 table, bytes32 schema) public override {
    StoreCore.registerSchema(table, schema);
  }

  function set(
    bytes32 table,
    bytes32[] memory key,
    bytes32 encodedDynamicLength,
    bytes memory data
  ) public override {
    StoreCore.set(table, key, encodedDynamicLength, data);
  }

  function setStaticData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) public override {
    StoreCore.setStaticData(table, key, data);
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) public override {
    StoreCore.setField(table, key, schemaIndex, data);
  }

  function registerSystem(
    address contractAddress,
    string memory contractName,
    string memory functionSig,
    ExecutionMode executionMode
  ) public {
    // TODO: checks
    bytes4 worldSelector = bytes4(keccak256(abi.encodePacked(contractName, "_", functionSig)));
    bytes4 funcSelector = bytes4(keccak256(abi.encodePacked(functionSig)));
    RouteTable.set(bytes32(worldSelector), contractAddress, funcSelector, uint8(executionMode));
  }

  fallback() external payable {
    // Find system by generated function selector
    Route memory route = RouteTable.get(bytes32(msg.sig));

    address addr = route.addr;
    bytes4 selector = route.selector;

    if (addr == address(0)) revert World_InvalidSystem();

    // Call the system function via `call` if the system is autonomous
    if (route.executionMode == uint8(ExecutionMode.Autonomous)) {
      assembly {
        // place system function selector at memory position 0
        mstore(0, selector)

        // place existing calldata (exclusing selector) after system function selector
        calldatacopy(4, 4, sub(calldatasize(), 4))

        // place msg.sender after calldata
        mstore(calldatasize(), caller())

        // execute function call using the system and pass the constructed calldata
        let result := call(gas(), addr, callvalue(), 0, add(calldatasize(), 32), 0, 0)

        // place any return value into memory at position 0
        returndatacopy(0, 0, returndatasize())

        // return any return value or error back to the caller
        switch result
        case 0 {
          revert(0, returndatasize())
        }
        default {
          return(0, returndatasize())
        }
      }
    }

    // Call the system function via `delegatecall` if the system is autonomous
    if (route.executionMode == uint8(ExecutionMode.Delegate)) {
      assembly {
        // place system function selector at memory position 0
        mstore(0, selector)

        // place existing calldata (exclusing selector) after system function selector
        calldatacopy(4, 4, sub(calldatasize(), 4))

        // place msg.sender after calldata
        mstore(calldatasize(), caller())

        // execute function call using the system and pass the constructed calldata
        let result := delegatecall(gas(), addr, 0, add(calldatasize(), 32), 0, 0)

        // place any return value into memory at position 0
        returndatacopy(0, 0, returndatasize())

        // return any return value or error back to the caller
        switch result
        case 0 {
          revert(0, returndatasize())
        }
        default {
          return(0, returndatasize())
        }
      }
    }
  }
}
