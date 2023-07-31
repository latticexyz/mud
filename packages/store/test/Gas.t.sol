// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { Storage } from "../src/Storage.sol";
import { Mixed, MixedData } from "../src/codegen/Tables.sol";

contract SomeContract {
  function doSomethingWithBytes(bytes memory data) public {}
}

contract GasTest is Test, GasReporter {
  SomeContract someContract = new SomeContract();

  function testCompareAbiEncodeVsCustom() public {
    MixedData memory mixed = MixedData({ u32: 1, u128: 2, a32: new uint32[](3), s: "hello" });
    mixed.a32[0] = 1;
    mixed.a32[1] = 2;
    mixed.a32[2] = 3;

    startGasReport("abi encode");
    bytes memory abiEncoded = abi.encode(mixed);
    endGasReport();

    startGasReport("abi decode");
    MixedData memory abiDecoded = abi.decode(abiEncoded, (MixedData));
    endGasReport();

    startGasReport("custom encode");
    bytes memory customEncoded = Mixed.encode(mixed.u32, mixed.u128, mixed.a32, mixed.s);
    endGasReport();

    startGasReport("custom decode");
    MixedData memory customDecoded = Mixed.decode(customEncoded);
    endGasReport();

    console.log("Length comparison: abi encode %s, custom %s", abiEncoded.length, customEncoded.length);

    startGasReport("pass abi encoded bytes to external contract");
    someContract.doSomethingWithBytes(abiEncoded);
    endGasReport();

    startGasReport("pass custom encoded bytes to external contract");
    someContract.doSomethingWithBytes(customEncoded);
    endGasReport();

    assertEq(abi.encode(abiDecoded), abi.encode(customDecoded));
  }

  function testCompareStorageWriteSolidity() public {
    (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words) = SolidityStorage.generateValues();
    (
      SolidityStorage.LayoutSimple storage layoutSimple,
      SolidityStorage.LayoutPartial storage layoutPartial,
      SolidityStorage.LayoutBytes storage layoutBytes
    ) = SolidityStorage.layouts();

    startGasReport("solidity storage write (cold, 1 word)");
    layoutSimple.value = valueSimple;
    endGasReport();

    startGasReport("solidity storage write (cold, 1 word, partial)");
    layoutPartial.value = valuePartial;
    endGasReport();

    // 10 becase length is also stored
    startGasReport("solidity storage write (cold, 10 words)");
    layoutBytes.value = value9Words;
    endGasReport();

    // get new values
    (valueSimple, valuePartial, value9Words) = SolidityStorage.generateValues();

    startGasReport("solidity storage write (warm, 1 word)");
    layoutSimple.value = valueSimple;
    endGasReport();

    startGasReport("solidity storage write (warm, 1 word, partial)");
    layoutPartial.value = valuePartial;
    endGasReport();

    startGasReport("solidity storage write (warm, 10 words)");
    layoutBytes.value = value9Words;
    endGasReport();
  }

  // Note that this compares storage writes in isolation, which can be misleading,
  // since MUD encoding is dynamic and separate from storage,
  // but solidity encoding is hardcoded at compile-time and is part of writing to storage.
  // (look for comparison of native storage vs MUD tables for a more comprehensive overview)
  function testCompareStorageWriteMUD() public {
    (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words) = SolidityStorage.generateValues();
    bytes memory encodedSimple = abi.encodePacked(valueSimple);
    bytes memory encodedPartial = abi.encodePacked(valuePartial);
    bytes memory encoded9Words = abi.encodePacked(value9Words.length, value9Words);

    startGasReport("MUD storage write (cold, 1 word)");
    Storage.store(SolidityStorage.STORAGE_SLOT_SIMPLE, 0, encodedSimple);
    endGasReport();

    startGasReport("MUD storage write (cold, 1 word, partial)");
    Storage.store(SolidityStorage.STORAGE_SLOT_PARTIAL, 16, encodedPartial);
    endGasReport();

    // 10 becase length is also stored
    startGasReport("MUD storage write (cold, 10 words)");
    Storage.store(SolidityStorage.STORAGE_SLOT_BYTES, 0, encoded9Words);
    endGasReport();

    // get new values
    (valueSimple, valuePartial, value9Words) = SolidityStorage.generateValues();

    startGasReport("MUD storage write (warm, 1 word)");
    Storage.store(SolidityStorage.STORAGE_SLOT_SIMPLE, 0, encodedSimple);
    endGasReport();

    startGasReport("MUD storage write (warm, 1 word, partial)");
    Storage.store(SolidityStorage.STORAGE_SLOT_PARTIAL, 16, encodedPartial);
    endGasReport();

    startGasReport("MUD storage write (warm, 10 words)");
    Storage.store(SolidityStorage.STORAGE_SLOT_BYTES, 0, encoded9Words);
    endGasReport();
  }
}

library SolidityStorage {
  uint256 internal constant STORAGE_SLOT_SIMPLE = uint256(keccak256("mud.store.storage.GasTest.simple"));
  uint256 internal constant STORAGE_SLOT_PARTIAL = uint256(keccak256("mud.store.storage.GasTest.partial"));
  uint256 internal constant STORAGE_SLOT_BYTES = uint256(keccak256("mud.store.storage.GasTest.bytes"));

  struct LayoutSimple {
    bytes32 value;
  }

  struct LayoutPartial {
    bytes16 _offset16;
    bytes16 value;
  }

  struct LayoutBytes {
    bytes value;
  }

  function layouts()
    internal
    pure
    returns (LayoutSimple storage layoutSimple, LayoutPartial storage layoutPartial, LayoutBytes storage layoutBytes)
  {
    uint256 slotSimple = STORAGE_SLOT_SIMPLE;
    uint256 slotPartial = STORAGE_SLOT_PARTIAL;
    uint256 slotBytes = STORAGE_SLOT_BYTES;
    assembly {
      layoutSimple.slot := slotSimple
      layoutPartial.slot := slotPartial
      layoutBytes.slot := slotBytes
    }
  }

  function generateValues()
    internal
    view
    returns (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words)
  {
    valueSimple = keccak256(abi.encode(gasleft()));
    valuePartial = bytes16(keccak256(abi.encode(gasleft())));
    value9Words = new bytes(256);
    for (uint256 i; i < 256; i++) {
      value9Words[i] = bytes1(keccak256(abi.encode(gasleft())));
    }
  }
}
