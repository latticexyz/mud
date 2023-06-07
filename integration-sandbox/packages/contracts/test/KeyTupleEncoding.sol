// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";

import { KeyTupleEncoding } from "../src/codegen/Tables.sol";
import { Colors, DogBreeds } from "../src/codegen/Types.sol";

contract KeyTupleEncodingTest is MudV2Test {
  function testKeyTupleEncoding() public {
    uint256 bigint = 42;
    int32 signed = -42;
    bytes16 halfBytes = bytes16(hex"1234");
    address sender = 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF;
    bool isTrue = true;
    Colors color = Colors.Yellow;
    DogBreeds dogBreed = DogBreeds.Husky;

    bytes32[] memory keyTuple = KeyTupleEncoding.encodeKeyTuple({
      bigint: bigint,
      signed: signed,
      halfBytes: halfBytes,
      sender: sender,
      isTrue: isTrue,
      color: color,
      dogBreed: dogBreed
    });

    assertEq(keyTuple.length, 7);

    // assert that the key tuple is encoded how we expect
    assertEq(keyTuple[0], bytes32(hex"000000000000000000000000000000000000000000000000000000000000002a"));
    assertEq(keyTuple[1], bytes32(hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6"));
    assertEq(keyTuple[2], bytes32(hex"1234000000000000000000000000000000000000000000000000000000000000"));
    assertEq(keyTuple[3], bytes32(hex"000000000000000000000000ffffffffffffffffffffffffffffffffffffffff"));
    assertEq(keyTuple[4], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000001"));
    assertEq(keyTuple[5], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000002"));
    assertEq(keyTuple[6], bytes32(hex"0000000000000000000000000000000000000000000000000000000000000003"));

    // assert that the key tuple encoding matches abi.encode (our implementation is more gas efficient)
    assertEq(keyTuple[0], bytes32(abi.encode(bigint)));
    assertEq(keyTuple[1], bytes32(abi.encode(signed)));
    assertEq(keyTuple[2], bytes32(abi.encode(halfBytes)));
    assertEq(keyTuple[3], bytes32(abi.encode(sender)));
    assertEq(keyTuple[4], bytes32(abi.encode(isTrue)));
    assertEq(keyTuple[5], bytes32(abi.encode(color)));
    assertEq(keyTuple[6], bytes32(abi.encode(dogBreed)));
  }
}
