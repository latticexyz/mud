// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { Statics, StaticsData, Dynamics, DynamicsData, Singleton, Ephemeral } from "../src/codegen/Tables.sol";

import { Enum1, Enum2 } from "../src/codegen/Types.sol";

contract TablegenTest is Test, StoreReadWithStubs {
  function testStaticsSetAndGet() public {
    Statics.registerSchema();

    uint256 k1 = 1;
    int32 k2 = -1;
    bytes16 k3 = hex"02";
    address k4 = address(123);
    bool k5 = true;
    Enum1 k6 = Enum1.E3;
    Enum2 k7 = Enum2.E1;

    Statics.setV1(k1, k2, k3, k4, k5, k6, k7, 4);
    assertEq(Statics.getV1(k1, k2, k3, k4, k5, k6, k7), 4);

    StaticsData memory data = StaticsData(4, -5, hex"06", address(456), false, Enum1.E2, Enum2.E1);
    Statics.set(k1, k2, k3, k4, k5, k6, k7, data);
    assertEq(abi.encode(Statics.get(k1, k2, k3, k4, k5, k6, k7)), abi.encode(data));
  }

  function testDynamicsSetAndGet() public {
    Dynamics.registerSchema();

    bytes32 key = keccak256("key");

    // using `get` before setting any data should return default empty values
    DynamicsData memory emptyData;
    assertEq(abi.encode(Dynamics.get(key)), abi.encode(emptyData));

    // initialize values
    bool[5] memory staticBools = [true, false, true, true, false];
    uint64[] memory u64 = new uint64[](5);
    u64[0] = 0;
    u64[1] = 1;
    u64[2] = type(uint64).max / 2;
    u64[3] = type(uint64).max - 1;
    u64[4] = type(uint64).max;
    string memory str = "Lorem ipsum dolor sit amet, consectetur adipiscing elit,";
    bytes memory b = hex"ff";
    // combine them into a struct
    DynamicsData memory data = DynamicsData(
      [keccak256("value")],
      [int32(-123), 123],
      [type(uint128).max, 123, 456],
      [address(this), address(0x0), address(0x1), address(0x2)],
      staticBools,
      u64,
      str,
      b
    );

    // test that the record is set correctly
    Dynamics.set(key, data);
    assertEq(abi.encode(Dynamics.get(key)), abi.encode(data));

    // test setting single fields
    Dynamics.setStaticBools(key, staticBools);
    assertEq(abi.encode(Dynamics.getStaticBools(key)), abi.encode(staticBools));

    Dynamics.setU64(key, u64);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64));
  }

  function testDynamicsPushAndPop() public {
    Dynamics.registerSchema();

    bytes32 key = keccak256("key");

    uint64[] memory u64_1 = new uint64[](1);
    u64_1[0] = 123;

    uint64[] memory u64_2 = new uint64[](1);
    u64_2[0] = 456;

    uint64[] memory u64_full = new uint64[](2);
    u64_full[0] = 123;
    u64_full[1] = 456;

    Dynamics.pushU64(key, 123);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64_1));
    Dynamics.pushU64(key, 456);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64_full));

    Dynamics.popU64(key);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64_1));
    Dynamics.pushU64(key, 456);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64_full));
    Dynamics.popU64(key);
    assertEq(abi.encode(Dynamics.getU64(key)), abi.encode(u64_1));
    Dynamics.popU64(key);
    assertEq(Dynamics.getU64(key).length, 0);
  }

  function testSingletonSetAndGet() public {
    Singleton.registerSchema();

    Singleton.set(-10, [uint32(1), 2], [uint32(3), 4], [uint32(5)]);
    assertEq(Singleton.getV1(), -10);
    assertEq(abi.encode(Singleton.getV2()), abi.encode([uint32(1), 2]));
    assertEq(abi.encode(Singleton.getV3()), abi.encode([uint32(3), 4]));
    assertEq(abi.encode(Singleton.getV4()), abi.encode([uint32(5)]));
  }

  function testEphemeral() public {
    Ephemeral.registerSchema();

    Ephemeral.emitEphemeral("key", 123);
  }
}
