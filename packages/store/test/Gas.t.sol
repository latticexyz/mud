// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-reporter/src/GasReporter.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";

struct Mixed {
  uint32 u32;
  uint128 u128;
  uint32[] a32;
  string s;
}

contract SomeContract {
  function doSomethingWithBytes(bytes memory data) public {}
}

contract GasTest is Test, GasReporter {
  SomeContract someContract = new SomeContract();

  function testCompareAbiEncodeVsCustom() public {
    Mixed memory mixed = Mixed({ u32: 1, u128: 2, a32: new uint32[](3), s: "hello" });
    mixed.a32[0] = 1;
    mixed.a32[1] = 2;
    mixed.a32[2] = 3;

    startGasReport("abi encode");
    bytes memory abiEncoded = abi.encode(mixed);
    endGasReport();

    startGasReport("abi decode");
    Mixed memory abiDecoded = abi.decode(abiEncoded, (Mixed));
    endGasReport();

    startGasReport("custom encode");
    bytes memory customEncoded = customEncode(mixed);
    endGasReport();

    startGasReport("custom decode");
    Mixed memory customDecoded = customDecode(customEncoded);
    endGasReport();

    console.log("Length comparison: abi encode %s, custom %s", abiEncoded.length, customEncoded.length);

    startGasReport("pass abi encoded bytes to external contract");
    someContract.doSomethingWithBytes(abiEncoded);
    endGasReport();

    startGasReport("pass custom encoded bytes to external contract");
    someContract.doSomethingWithBytes(customEncoded);
    endGasReport();

    assertEq(keccak256(abi.encode(abiDecoded)), keccak256(abi.encode(customDecoded)));
  }
}

function customEncode(Mixed memory mixed) pure returns (bytes memory) {
  return abi.encodePacked(mixed.u32, mixed.u128, EncodeArray.encode(mixed.a32), mixed.s);
}

function customDecode(bytes memory input) view returns (Mixed memory) {
  return
    Mixed({
      u32: uint32(Bytes.slice4(input, 0)),
      u128: uint128(Bytes.slice16(input, 4)),
      a32: SliceLib.getSubslice(input, 20, 20 + 3 * 4).decodeArray_uint32(),
      s: string(SliceLib.getSubslice(input, 20 + 3 * 4, input.length).toBytes())
    });
}
