// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";

import { StoreRead } from "@latticexyz/store/src/StoreRead.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Tables } from "@latticexyz/store/src/codegen/index.sol";

import { WorldContextProviderLib } from "../src/WorldContext.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { ResourceId, WorldResourceIdInstance } from "../src/WorldResourceId.sol";

import { createCoreModule } from "./createCoreModule.sol";

contract WorldMock is StoreRead {
  constructor() {
    StoreSwitch.setStoreAddress(address(this));
  }

  function delegatecallFromWorld(address target, bytes memory callData) public {
    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: msg.sender,
      msgValue: 0,
      target: target,
      callData: callData
    });
  }
}

contract CoreModuleTest is Test {
  CoreModule coreModule;
  WorldMock worldMock;

  function setUp() public {
    coreModule = createCoreModule();
    worldMock = new WorldMock();
    StoreSwitch.setStoreAddress(address(worldMock));
  }

  function testInstallRoot() public {
    // Prepare tableIds for registration validation
    bytes32[] memory tableIds = getTableIdsFromStoreAndWorldConfigs();

    // Invoke installRoot
    worldMock.delegatecallFromWorld(address(coreModule), abi.encodeCall(CoreModule.installRoot, (new bytes(0))));

    // Confirm that each tableId is registered
    for (uint256 i; i < tableIds.length; i++) {
      ResourceId resourceId = ResourceId.wrap(tableIds[i]);
      assertFalse(
        Tables.getFieldLayout(resourceId).isEmpty(),
        string.concat("table should be registered: ", WorldResourceIdInstance.toString(resourceId))
      );
    }
  }

  function getTableIdsFromStoreAndWorldConfigs() private returns (bytes32[] memory) {
    string[] memory ffiInputs = new string[](3);
    ffiInputs[0] = "pnpm";
    ffiInputs[1] = "tsx";
    ffiInputs[2] = "ts/scripts/list-tables-from-store-and-world-configs.ts";

    bytes memory ffiOutput = vm.ffi(ffiInputs);

    // The JSONPath `$[*].id` selects the `id` of all elements in the root array
    bytes memory encoded = vm.parseJson(string(ffiOutput), "$[*].id");
    bytes32[] memory tableIds = abi.decode(encoded, (bytes32[]));

    return tableIds;
  }
}
