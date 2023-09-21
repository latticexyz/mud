// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Bytes } from "../../src/Bytes.sol";
import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";

contract EncodeArrayTest is Test, GasReporter {
  function testEncodeUint8Array() public {
    uint8 val0 = 0x01;
    uint8 val1 = 0x02;
    uint8[] memory input = new uint8[](2);
    input[0] = val0;
    input[1] = val1;

    startGasReport("encode packed uint8[]");
    bytes memory output = EncodeArray.encode(input);
    endGasReport();

    assertEq(output, abi.encodePacked(val0, val1));
  }

  function testEncodeUint16Array() public {
    uint16 val0 = 0x0102;
    uint16 val1 = 0x0304;
    uint16 val2 = 0x0506;
    uint16[] memory input = new uint16[](3);
    input[0] = val0;
    input[1] = val1;
    input[2] = val2;

    startGasReport("encode packed uint16[]");
    bytes memory output = EncodeArray.encode(input);
    endGasReport();

    assertEq(output, abi.encodePacked(val0, val1, val2));
  }

  function testEncodeUint32Array() public {
    uint32 val0 = 0x01020304;
    uint32 val1 = 0x05060708;
    uint32[] memory input = new uint32[](2);
    input[0] = val0;
    input[1] = val1;

    startGasReport("encode packed uint32[]");
    bytes memory output = EncodeArray.encode(input);
    endGasReport();

    assertEq(output, abi.encodePacked(val0, val1));
  }
}
