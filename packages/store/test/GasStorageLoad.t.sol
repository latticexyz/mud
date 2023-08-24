// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Storage } from "../src/Storage.sol";
import { SolidityStorage, SomeContract } from "./Gas.t.sol";

contract GasStorageLoadTest is Test, GasReporter {
  SomeContract someContract = new SomeContract();

  // Cold loads require us to initialize the values outside of their test
  function setUp() public {
    (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words) = SolidityStorage.generateValues();
    (
      SolidityStorage.LayoutSimple storage layoutSimple,
      SolidityStorage.LayoutPartial storage layoutPartial,
      SolidityStorage.LayoutBytes storage layoutBytes
    ) = SolidityStorage.layouts();

    layoutSimple.value = valueSimple;
    layoutPartial.value = valuePartial;
    layoutBytes.value = value9Words;
  }

  function testCompareStorageLoadSolidity() public {
    (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words) = SolidityStorage.generateValues();
    (
      SolidityStorage.LayoutSimple storage layoutSimple,
      SolidityStorage.LayoutPartial storage layoutPartial,
      SolidityStorage.LayoutBytes storage layoutBytes
    ) = SolidityStorage.layouts();

    startGasReport("solidity storage load (cold, 1 word)");
    valueSimple = layoutSimple.value;
    endGasReport();

    startGasReport("solidity storage load (cold, 1 word, partial)");
    valuePartial = layoutPartial.value;
    endGasReport();

    startGasReport("solidity storage load (cold, 10 words)");
    value9Words = layoutBytes.value;
    endGasReport();

    // warm

    startGasReport("solidity storage load (warm, 1 word)");
    valueSimple = layoutSimple.value;
    endGasReport();

    startGasReport("solidity storage load (warm, 1 word, partial)");
    valuePartial = layoutPartial.value;
    endGasReport();

    startGasReport("solidity storage load (warm, 10 words)");
    value9Words = layoutBytes.value;
    endGasReport();

    // Do something in case the optimizer removes unused assignments
    someContract.doSomethingWithBytes(abi.encode(valueSimple, valuePartial, value9Words));
  }

  function testCompareStorageLoadMUD() public {
    (bytes32 valueSimple, bytes16 valuePartial, bytes memory value9Words) = SolidityStorage.generateValues();
    bytes memory encodedSimple = abi.encodePacked(valueSimple);
    bytes memory encodedPartial = abi.encodePacked(valuePartial);
    bytes memory encoded9Words = abi.encodePacked(value9Words.length, value9Words);

    startGasReport("MUD storage load (cold, 1 word)");
    encodedSimple = Storage.load(SolidityStorage.STORAGE_SLOT_SIMPLE, encodedSimple.length, 0);
    endGasReport();

    startGasReport("MUD storage load (cold, 1 word, partial)");
    encodedPartial = Storage.load(SolidityStorage.STORAGE_SLOT_PARTIAL, encodedPartial.length, 16);
    endGasReport();

    startGasReport("MUD storage load (cold, 10 words)");
    encoded9Words = Storage.load(SolidityStorage.STORAGE_SLOT_BYTES, encoded9Words.length, 0);
    endGasReport();

    // warm

    startGasReport("MUD storage load (warm, 1 word)");
    encodedSimple = Storage.load(SolidityStorage.STORAGE_SLOT_SIMPLE, encodedSimple.length, 0);
    endGasReport();

    startGasReport("MUD storage load (warm, 1 word, partial)");
    encodedPartial = Storage.load(SolidityStorage.STORAGE_SLOT_PARTIAL, encodedPartial.length, 16);
    endGasReport();

    startGasReport("MUD storage load (warm, 10 words)");
    encoded9Words = Storage.load(SolidityStorage.STORAGE_SLOT_BYTES, encoded9Words.length, 0);
    endGasReport();

    // Do something in case the optimizer removes unused assignments
    someContract.doSomethingWithBytes(abi.encode(encodedSimple, encodedPartial, encoded9Words));
  }
}
