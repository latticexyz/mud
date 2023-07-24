// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
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
}
