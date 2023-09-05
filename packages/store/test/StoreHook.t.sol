// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { EchoSubscriber } from "./EchoSubscriber.sol";
import { RevertSubscriber } from "./RevertSubscriber.sol";

import { StoreHook, EnabledHooks, HookType } from "../src/StoreHook.sol";
import { StoreHookLib } from "../src/StoreHook.sol";
import { IStoreHook } from "../src/IStore.sol";
import { Schema } from "../src/Schema.sol";

contract StoreHookTest is Test, GasReporter {
  event HookCalled(bytes);

  // Testdata
  EchoSubscriber private echoSubscriber = new EchoSubscriber();
  RevertSubscriber private revertSubscriber = new RevertSubscriber();
  bytes32 private tableId = "table";
  bytes32[] private key = new bytes32[](1);
  bytes private data = "data";
  uint8 private schemaIndex = 1;
  Schema private valueSchema = Schema.wrap(0);

  function testEncodeBitmap() public {
    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: false,
          beforeSetField: false,
          afterSetField: false,
          beforeDeleteRecord: false,
          afterDeleteRecord: false
        })
      ),
      uint8(0x00),
      "0b00000000"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: true,
          afterSetRecord: false,
          beforeSetField: false,
          afterSetField: false,
          beforeDeleteRecord: false,
          afterDeleteRecord: false
        })
      ),
      uint8(0x01),
      "0b00000001"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: true,
          beforeSetField: false,
          afterSetField: false,
          beforeDeleteRecord: false,
          afterDeleteRecord: false
        })
      ),
      uint8(0x02),
      "0b00000010"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: false,
          beforeSetField: true,
          afterSetField: false,
          beforeDeleteRecord: false,
          afterDeleteRecord: false
        })
      ),
      uint8(0x04),
      "0b00000100"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: false,
          beforeSetField: false,
          afterSetField: true,
          beforeDeleteRecord: false,
          afterDeleteRecord: false
        })
      ),
      uint8(0x08),
      "0b00001000"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: false,
          beforeSetField: false,
          afterSetField: false,
          beforeDeleteRecord: true,
          afterDeleteRecord: false
        })
      ),
      uint8(0x10),
      "0b00010000"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: false,
          afterSetRecord: false,
          beforeSetField: false,
          afterSetField: false,
          beforeDeleteRecord: false,
          afterDeleteRecord: true
        })
      ),
      uint8(0x20),
      "0b00100000"
    );

    assertEq(
      StoreHookLib.encodeBitmap(
        EnabledHooks({
          beforeSetRecord: true,
          afterSetRecord: true,
          beforeSetField: true,
          afterSetField: true,
          beforeDeleteRecord: true,
          afterDeleteRecord: true
        })
      ),
      uint8(0x3f),
      "0b00111111"
    );
  }

  function testEncode() public {
    assertEq(
      StoreHook.unwrap(
        StoreHookLib.encode(
          echoSubscriber,
          EnabledHooks({
            beforeSetRecord: true,
            afterSetRecord: true,
            beforeSetField: true,
            afterSetField: true,
            beforeDeleteRecord: true,
            afterDeleteRecord: true
          })
        )
      ),
      bytes21(abi.encodePacked(echoSubscriber, uint8(0x3f)))
    );
  }

  function testFuzzEncode(
    address hookAddress,
    bool enableBeforeSetRecord,
    bool enableAfterSetRecord,
    bool enableBeforeSetField,
    bool enableAfterSetField,
    bool enableBeforeDeleteRecord,
    bool enableAfterDeleteRecord
  ) public {
    EnabledHooks memory enabledHooks = EnabledHooks({
      beforeSetRecord: enableBeforeSetRecord,
      afterSetRecord: enableAfterSetRecord,
      beforeSetField: enableBeforeSetField,
      afterSetField: enableAfterSetField,
      beforeDeleteRecord: enableBeforeDeleteRecord,
      afterDeleteRecord: enableAfterDeleteRecord
    });

    assertEq(
      StoreHook.unwrap(StoreHookLib.encode(IStoreHook(hookAddress), enabledHooks)),
      bytes21(abi.encodePacked(hookAddress, uint8(StoreHookLib.encodeBitmap(enabledHooks))))
    );
  }

  function testIsEnabled() public {
    StoreHook storeHook = StoreHookLib.encode(
      echoSubscriber,
      EnabledHooks({
        beforeSetRecord: false,
        afterSetRecord: false,
        beforeSetField: true,
        afterSetField: false,
        beforeDeleteRecord: false,
        afterDeleteRecord: false
      })
    );

    startGasReport("check if store hook is enabled");
    storeHook.isEnabled(HookType.BEFORE_SET_RECORD);
    endGasReport();

    assertEq(storeHook.isEnabled(HookType.BEFORE_SET_RECORD), false);
    assertEq(storeHook.isEnabled(HookType.AFTER_SET_RECORD), false);
    assertEq(storeHook.isEnabled(HookType.BEFORE_SET_FIELD), true);
    assertEq(storeHook.isEnabled(HookType.AFTER_SET_FIELD), false);
    assertEq(storeHook.isEnabled(HookType.BEFORE_DELETE_RECORD), false);
    assertEq(storeHook.isEnabled(HookType.AFTER_DELETE_RECORD), false);
  }

  function testFuzzIsEnabled(
    address hookAddress,
    bool enableBeforeSetRecord,
    bool enableAfterSetRecord,
    bool enableBeforeSetField,
    bool enableAfterSetField,
    bool enableBeforeDeleteRecord,
    bool enableAfterDeleteRecord
  ) public {
    EnabledHooks memory enabledHooks = EnabledHooks({
      beforeSetRecord: enableBeforeSetRecord,
      afterSetRecord: enableAfterSetRecord,
      beforeSetField: enableBeforeSetField,
      afterSetField: enableAfterSetField,
      beforeDeleteRecord: enableBeforeDeleteRecord,
      afterDeleteRecord: enableAfterDeleteRecord
    });

    StoreHook storeHook = StoreHookLib.encode(IStoreHook(hookAddress), enabledHooks);

    assertEq(storeHook.isEnabled(HookType.BEFORE_SET_RECORD), enableBeforeSetRecord);
    assertEq(storeHook.isEnabled(HookType.AFTER_SET_RECORD), enableAfterSetRecord);
    assertEq(storeHook.isEnabled(HookType.BEFORE_SET_FIELD), enableBeforeSetField);
    assertEq(storeHook.isEnabled(HookType.AFTER_SET_FIELD), enableAfterSetField);
    assertEq(storeHook.isEnabled(HookType.BEFORE_DELETE_RECORD), enableBeforeDeleteRecord);
    assertEq(storeHook.isEnabled(HookType.AFTER_DELETE_RECORD), enableAfterDeleteRecord);
  }

  function testGetAddress() public {
    StoreHook storeHook = StoreHookLib.encode(
      echoSubscriber,
      EnabledHooks({
        beforeSetRecord: false,
        afterSetRecord: false,
        beforeSetField: true,
        afterSetField: false,
        beforeDeleteRecord: false,
        afterDeleteRecord: false
      })
    );

    startGasReport("get store hook address");
    storeHook.getAddress();
    endGasReport();

    assertEq(storeHook.getAddress(), address(echoSubscriber));
  }

  function testGetBitmap() public {
    EnabledHooks memory enabledHooks = EnabledHooks({
      beforeSetRecord: false,
      afterSetRecord: false,
      beforeSetField: true,
      afterSetField: false,
      beforeDeleteRecord: false,
      afterDeleteRecord: false
    });

    StoreHook storeHook = StoreHookLib.encode(echoSubscriber, enabledHooks);

    startGasReport("get store hook bitmap");
    storeHook.getBitmap();
    endGasReport();

    assertEq(storeHook.getBitmap(), StoreHookLib.encodeBitmap(enabledHooks));
  }

  function testCallHook() public {
    StoreHook storeHook = StoreHookLib.encode(
      echoSubscriber,
      EnabledHooks({
        beforeSetRecord: true,
        afterSetRecord: false,
        beforeSetField: false,
        afterSetField: false,
        beforeDeleteRecord: false,
        afterDeleteRecord: false
      })
    );

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, key, data, valueSchema));
    startGasReport("call an enabled hook");
    if (storeHook.isEnabled(HookType.BEFORE_SET_RECORD)) {
      IStoreHook(storeHook.getAddress()).onBeforeSetRecord(tableId, key, data, valueSchema);
    }
    endGasReport();

    StoreHook revertHook = StoreHookLib.encode(
      revertSubscriber,
      EnabledHooks({
        beforeSetRecord: false,
        afterSetRecord: false,
        beforeSetField: false,
        afterSetField: false,
        beforeDeleteRecord: false,
        afterDeleteRecord: false
      })
    );

    // Expect the to not be called - otherwise the test will fail with a revert
    startGasReport("call a disabled hook");
    if (revertHook.isEnabled(HookType.BEFORE_SET_RECORD)) {
      IStoreHook(revertHook.getAddress()).onBeforeSetRecord(tableId, key, data, valueSchema);
    }
    endGasReport();
  }
}
