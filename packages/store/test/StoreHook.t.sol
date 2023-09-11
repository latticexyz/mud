// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { EchoSubscriber } from "./EchoSubscriber.sol";
import { RevertSubscriber } from "./RevertSubscriber.sol";

import { Hook } from "../src/Hook.sol";
import { StoreHookType } from "../src/StoreHook.sol";
import { StoreHookLib } from "../src/StoreHook.sol";
import { IStoreHook } from "../src/IStore.sol";
import { Schema } from "../src/Schema.sol";
import { PackedCounter } from "../src/PackedCounter.sol";

contract StoreHookTest is Test, GasReporter {
  event HookCalled(bytes);

  // Testdata
  EchoSubscriber private echoSubscriber = new EchoSubscriber();
  RevertSubscriber private revertSubscriber = new RevertSubscriber();
  bytes32 private tableId = "table";
  bytes32[] private key = new bytes32[](1);
  bytes private staticData = abi.encodePacked(bytes32(0));
  PackedCounter private encodedLengths = PackedCounter.wrap(bytes32(0));
  bytes private dynamicData = new bytes(0);
  uint8 private schemaIndex = 1;
  Schema private valueSchema = Schema.wrap(0);

  function testEncodeBitmap() public {
    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      }),
      uint8(0x00),
      "0b00000000"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      }),
      uint8(0x01),
      "0b00000001"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: true,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      }),
      uint8(0x02),
      "0b00000010"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: true,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      }),
      uint8(0x04),
      "0b00000100"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: true,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      }),
      uint8(0x08),
      "0b00001000"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: false
      }),
      uint8(0x10),
      "0b00010000"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: true
      }),
      uint8(0x20),
      "0b00100000"
    );

    assertEq(
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      }),
      uint8(0x3f),
      "0b00111111"
    );
  }

  function testEncode() public {
    assertEq(
      Hook.unwrap(
        StoreHookLib.encode(
          echoSubscriber,
          StoreHookLib.encodeBitmap({
            onBeforeSetRecord: true,
            onAfterSetRecord: true,
            onBeforeSetField: true,
            onAfterSetField: true,
            onBeforeDeleteRecord: true,
            onAfterDeleteRecord: true
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
    uint8 encodedBitmap = StoreHookLib.encodeBitmap({
      onBeforeSetRecord: enableBeforeSetRecord,
      onAfterSetRecord: enableAfterSetRecord,
      onBeforeSetField: enableBeforeSetField,
      onAfterSetField: enableAfterSetField,
      onBeforeDeleteRecord: enableBeforeDeleteRecord,
      onAfterDeleteRecord: enableAfterDeleteRecord
    });
    assertEq(
      Hook.unwrap(StoreHookLib.encode(IStoreHook(hookAddress), encodedBitmap)),
      bytes21(abi.encodePacked(hookAddress, encodedBitmap))
    );
  }

  function testIsEnabled() public {
    Hook storeHook = StoreHookLib.encode(
      echoSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: true,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      })
    );

    startGasReport("check if store hook is enabled");
    storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD));
    endGasReport();

    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD)), false);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_SET_RECORD)), false);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD)), true);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD)), false);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_DELETE_RECORD)), false);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_DELETE_RECORD)), false);
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
    Hook storeHook = StoreHookLib.encode(
      IStoreHook(hookAddress),
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: enableBeforeSetRecord,
        onAfterSetRecord: enableAfterSetRecord,
        onBeforeSetField: enableBeforeSetField,
        onAfterSetField: enableAfterSetField,
        onBeforeDeleteRecord: enableBeforeDeleteRecord,
        onAfterDeleteRecord: enableAfterDeleteRecord
      })
    );

    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD)), enableBeforeSetRecord);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_SET_RECORD)), enableAfterSetRecord);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD)), enableBeforeSetField);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD)), enableAfterSetField);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.BEFORE_DELETE_RECORD)), enableBeforeDeleteRecord);
    assertEq(storeHook.isEnabled(uint8(StoreHookType.AFTER_DELETE_RECORD)), enableAfterDeleteRecord);
  }

  function testGetAddress() public {
    Hook storeHook = StoreHookLib.encode(
      echoSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: true,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      })
    );

    startGasReport("get store hook address");
    storeHook.getAddress();
    endGasReport();

    assertEq(storeHook.getAddress(), address(echoSubscriber));
  }

  function testGetBitmap() public {
    uint8 encodedBitmap = StoreHookLib.encodeBitmap({
      onBeforeSetRecord: false,
      onAfterSetRecord: false,
      onBeforeSetField: true,
      onAfterSetField: false,
      onBeforeDeleteRecord: false,
      onAfterDeleteRecord: false
    });

    Hook storeHook = StoreHookLib.encode(echoSubscriber, encodedBitmap);

    startGasReport("get store hook bitmap");
    storeHook.getBitmap();
    endGasReport();

    assertEq(storeHook.getBitmap(), encodedBitmap);
  }

  function testCallHook() public {
    Hook storeHook = StoreHookLib.encode(
      echoSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      })
    );

    // TODO temporary variable until https://github.com/foundry-rs/foundry/issues/5811 is fixed
    bytes memory emptyDynamicData = new bytes(0);

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, key, staticData, encodedLengths, emptyDynamicData, valueSchema));
    startGasReport("call an enabled hook");
    if (storeHook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD))) {
      IStoreHook(storeHook.getAddress()).onBeforeSetRecord(
        tableId,
        key,
        staticData,
        encodedLengths,
        dynamicData,
        valueSchema
      );
    }
    endGasReport();

    Hook revertHook = StoreHookLib.encode(
      revertSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: false,
        onAfterSetRecord: false,
        onBeforeSetField: false,
        onAfterSetField: false,
        onBeforeDeleteRecord: false,
        onAfterDeleteRecord: false
      })
    );

    // Expect the to not be called - otherwise the test will fail with a revert
    startGasReport("call a disabled hook");
    if (revertHook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD))) {
      IStoreHook(revertHook.getAddress()).onBeforeSetRecord(
        tableId,
        key,
        staticData,
        encodedLengths,
        dynamicData,
        valueSchema
      );
    }
    endGasReport();
  }
}
