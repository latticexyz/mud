// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";

import { KeyTupleEncoding } from "../src/codegen/Tables.sol";
import { Colors, DogBreeds } from "../src/codegen/Types.sol";

contract KeyTupleEncodingTest is MudV2Test {
  function testKeyTupleEncoding() public {
    bytes32[] memory keyTuple = KeyTupleEncoding.encodeKeyTuple({
      bigint: uint256(42),
      signed: int32(-42),
      halfBytes: bytes16(hex"1234"),
      sender: address(0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF),
      isTrue: true,
      color: Colors.Yellow,
      dogBreed: DogBreeds.Husky
    });

    assertEq(keyTuple.length, 7);
    assertEq(keyTuple[0], bytes32(hex"000000000000000000000000000000000000000000000000000000000000002a"));
    assertEq(keyTuple[1], bytes32(hex"00000000000000000000000000000000000000000000000000000000ffffffd6"));
    assertEq(keyTuple[2], bytes32(hex"1234000000000000000000000000000000000000000000000000000000000000"));
    assertEq(keyTuple[3], bytes32(hex"000000000000000000000000ffffffffffffffffffffffffffffffffffffffff"));
    assertEq(keyTuple[4], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000001"));
    assertEq(keyTuple[5], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000002"));
    assertEq(keyTuple[6], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000003"));
  }
}
