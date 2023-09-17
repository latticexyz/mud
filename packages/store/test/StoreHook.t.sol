// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { EchoSubscriber } from "./EchoSubscriber.sol";
import { RevertSubscriber } from "./RevertSubscriber.sol";

import { Hook, HookLib } from "../src/Hook.sol";
import { IStoreHook } from "../src/IStore.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { BEFORE_SET_RECORD, AFTER_SET_RECORD, BEFORE_SET_FIELD, AFTER_SET_FIELD, BEFORE_DELETE_RECORD, AFTER_DELETE_RECORD } from "../src/storeHookTypes.sol";

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
  uint8 private fieldIndex = 1;
  FieldLayout private fieldLayout = FieldLayout.wrap(0);

  function testEncodeBitmap() public {
    assertEq(BEFORE_SET_RECORD, uint8(0x01), "0b00000001");

    assertEq(AFTER_SET_RECORD, uint8(0x02), "0b00000010");

    assertEq(BEFORE_SET_FIELD, uint8(0x04), "0b00000100");

    assertEq(AFTER_SET_FIELD, uint8(0x08), "0b00001000");

    assertEq(BEFORE_DELETE_RECORD, uint8(0x10), "0b00010000");

    assertEq(AFTER_DELETE_RECORD, uint8(0x20), "0b00100000");

    assertEq(
      BEFORE_SET_RECORD |
        AFTER_SET_RECORD |
        BEFORE_SET_FIELD |
        AFTER_SET_FIELD |
        BEFORE_DELETE_RECORD |
        AFTER_DELETE_RECORD,
      uint8(0x3f),
      "0b00111111"
    );
  }

  function testEncode() public {
    assertEq(
      Hook.unwrap(
        HookLib.encode(
          address(echoSubscriber),
          BEFORE_SET_RECORD |
            AFTER_SET_RECORD |
            BEFORE_SET_FIELD |
            AFTER_SET_FIELD |
            BEFORE_DELETE_RECORD |
            AFTER_DELETE_RECORD
        )
      ),
      bytes21(abi.encodePacked(echoSubscriber, uint8(0x3f)))
    );
  }

  function testIsEnabled() public {
    Hook storeHook = HookLib.encode(address(echoSubscriber), BEFORE_SET_FIELD | AFTER_DELETE_RECORD);

    startGasReport("check if store hook is enabled");
    storeHook.isEnabled(BEFORE_SET_RECORD);
    endGasReport();

    assertFalse(storeHook.isEnabled(BEFORE_SET_RECORD), "BEFORE_SET_RECORD");
    assertFalse(storeHook.isEnabled(AFTER_SET_RECORD), "AFTER_SET_RECORD");
    assertTrue(storeHook.isEnabled(BEFORE_SET_FIELD), "BEFORE_SET_FIELD");
    assertFalse(storeHook.isEnabled(AFTER_SET_FIELD), "AFTER_SET_FIELD");
    assertFalse(storeHook.isEnabled(BEFORE_DELETE_RECORD), "BEFORE_DELETE_RECORD");
    assertTrue(storeHook.isEnabled(AFTER_DELETE_RECORD), "AFTER_DELETE_RECORD");
  }

  function testGetAddress() public {
    Hook storeHook = HookLib.encode(address(echoSubscriber), BEFORE_SET_FIELD);

    startGasReport("get store hook address");
    storeHook.getAddress();
    endGasReport();

    assertEq(storeHook.getAddress(), address(echoSubscriber));
  }

  function testCallHook() public {
    Hook storeHook = HookLib.encode(address(echoSubscriber), BEFORE_SET_RECORD);

    // TODO temporary variable until https://github.com/foundry-rs/foundry/issues/5811 is fixed
    bytes memory emptyDynamicData = new bytes(0);

    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(tableId, key, staticData, encodedLengths, emptyDynamicData, fieldLayout));
    startGasReport("call an enabled hook");
    if (storeHook.isEnabled(BEFORE_SET_RECORD)) {
      IStoreHook(storeHook.getAddress()).onBeforeSetRecord(
        tableId,
        key,
        staticData,
        encodedLengths,
        dynamicData,
        fieldLayout
      );
    }
    endGasReport();

    Hook revertHook = HookLib.encode(address(revertSubscriber), 0);

    // Expect the to not be called - otherwise the test will fail with a revert
    startGasReport("call a disabled hook");
    if (revertHook.isEnabled(BEFORE_SET_RECORD)) {
      IStoreHook(revertHook.getAddress()).onBeforeSetRecord(
        tableId,
        key,
        staticData,
        encodedLengths,
        dynamicData,
        fieldLayout
      );
    }
    endGasReport();
  }
}
