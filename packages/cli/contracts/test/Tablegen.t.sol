// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { StoreView } from "@latticexyz/store/src/StoreView.sol";

import { Table1, Table1Data } from "../src/tables/Table1.sol";
import { Enum1, Enum2 } from "../src/types.sol";
import { Singletons } from "../src/prototypes/Singletons.sol";
import { Singleton1, Singleton1TableId } from "../src/tables/Singleton1.sol";
import { Singleton2, Singleton2TableId } from "../src/tables/Singleton2.sol";

contract TablegenTest is Test, StoreView {
  function testTable1SetAndGet() public {
    Table1.registerSchema();

    uint256 k1 = 1;
    int32 k2 = -1;
    bytes16 k3 = hex"02";
    address k4 = address(123);
    bool k5 = true;
    Enum1 k6 = Enum1.E3;
    Enum2 k7 = Enum2.E1;

    Table1.setV1(k1, k2, k3, k4, k5, k6, k7, 4);
    assertEq(Table1.getV1(k1, k2, k3, k4, k5, k6, k7), 4);

    Table1Data memory data = Table1Data(4, -5, hex"06", address(456), false, Enum1.E2, Enum2.E1);
    Table1.set(k1, k2, k3, k4, k5, k6, k7, data);
    assertEq(abi.encode(Table1.get(k1, k2, k3, k4, k5, k6, k7)), abi.encode(data));
  }

  function testSingletonsPrototype() public {
    Singleton1.registerSchema();
    Singleton2.registerSchema();

    bytes32[] memory v1 = new bytes32[](2);
    v1[0] = hex"0102";
    v1[1] = hex"0304";
    Singletons.create(-123, v1);

    assertEq(Singleton1.get(), int256(-123));
    assertEq(abi.encode(Singleton2.get()), abi.encode(v1));

    Singletons.destroy();

    assertEq(Singleton1.get(), int256(0));
    assertEq(abi.encode(Singleton2.get()), abi.encode(new bytes32[](0)));

    assertEq(Singletons.getTableIds()[0], Singleton1TableId);
    assertEq(Singletons.getTableIds()[1], Singleton2TableId);
  }
}
