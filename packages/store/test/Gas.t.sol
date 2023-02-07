// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { Bytes } from "../src/Bytes.sol";
import { Buffer_ } from "../src/Buffer.sol";

struct Mixed {
  uint32 u32;
  uint128 u128;
  uint32[] a32;
  string s;
}

contract SomeContract {
  function doSomethingWithBytes(bytes memory data) public {}
}

contract GasTest is Test {
  SomeContract someContract = new SomeContract();

  function testCompareAbiEncodeVsCustom() public {
    Mixed memory mixed = Mixed({ u32: 1, u128: 2, a32: new uint32[](3), s: "hello" });
    mixed.a32[0] = 1;
    mixed.a32[1] = 2;
    mixed.a32[2] = 3;

    // !gasreport abi encode
    bytes memory abiEncoded = abi.encode(mixed);

    // !gasreport abi decode
    Mixed memory abiDecoded = abi.decode(abiEncoded, (Mixed));

    // !gasreport custom encode
    bytes memory customEncoded = customEncode(mixed);

    // !gasreport custom decode
    Mixed memory customDecoded = customDecode(customEncoded);

    console.log("Length comparison: abi encode %s, custom %s", abiEncoded.length, customEncoded.length);

    // !gasreport pass abi encoded bytes to external contract
    someContract.doSomethingWithBytes(abiEncoded);

    // !gasreport pass custom encoded bytes to external contract
    someContract.doSomethingWithBytes(customEncoded);

    assertEq(keccak256(abi.encode(abiDecoded)), keccak256(abi.encode(customDecoded)));
  }
}

function customEncode(Mixed memory mixed) pure returns (bytes memory) {
  return abi.encodePacked(mixed.u32, mixed.u128, Bytes.from(mixed.a32), mixed.s);
}

function customDecode(bytes memory input) view returns (Mixed memory) {
  console.log(input.length);

  return
    Mixed({
      u32: uint32(Bytes.slice4(input, 0)),
      u128: uint128(Bytes.slice16(input, 4)),
      a32: Bytes.toUint32Array(Bytes.slice(input, 20, 3 * 4)),
      s: string(Bytes.slice(input, 20 + 3 * 4, input.length - 20 - 3 * 4))
    });
}
