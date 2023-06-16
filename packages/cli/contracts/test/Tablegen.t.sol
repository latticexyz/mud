// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { Statics, StaticsData, Dynamics1, Dynamics1Data, Dynamics2, Dynamics2Data, Singleton, Ephemeral } from "../src/codegen/Tables.sol";

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
    Dynamics1.registerSchema();
    Dynamics2.registerSchema();

    bytes32 key = keccak256("key");

    // using `get` before setting any data should return default empty values
    Dynamics1Data memory emptyData1;
    Dynamics2Data memory emptyData2;
    assertEq(abi.encode(Dynamics1.get(key)), abi.encode(emptyData1));
    assertEq(abi.encode(Dynamics2.get(key)), abi.encode(emptyData2));

    // initialize values
    bytes32[1] memory staticB32 = [keccak256("value")];
    int32[2] memory staticI32 = [int32(-123), 123];
    uint128[3] memory staticU128 = [type(uint128).max, 123, 456];
    address[4] memory staticAddrs = [address(this), address(0x0), address(0x1), address(0x2)];
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
    Dynamics1Data memory data1 = Dynamics1Data(staticB32, staticI32, staticU128, staticAddrs, staticBools);
    Dynamics2Data memory data2 = Dynamics2Data(u64, str, b);

    // test that the record is set correctly
    Dynamics1.set(key, data1);
    assertEq(abi.encode(Dynamics1.get(key)), abi.encode(data1));
    Dynamics2.set(key, data2);
    assertEq(abi.encode(Dynamics2.get(key)), abi.encode(data2));

    // test length getters
    assertEq(Dynamics1.lengthStaticB32(key), staticB32.length);
    assertEq(Dynamics1.lengthStaticI32(key), staticI32.length);
    assertEq(Dynamics1.lengthStaticU128(key), staticU128.length);
    assertEq(Dynamics1.lengthStaticAddrs(key), staticAddrs.length);
    assertEq(Dynamics1.lengthStaticBools(key), staticBools.length);
    assertEq(Dynamics2.lengthU64(key), u64.length);
    assertEq(Dynamics2.lengthStr(key), bytes(str).length);
    assertEq(Dynamics2.lengthB(key), b.length);

    // test item getters
    assertEq(Dynamics1.getItemStaticB32(key, 0), staticB32[0]);
    assertEq(Dynamics1.getItemStaticI32(key, 1), staticI32[1]);
    assertEq(Dynamics1.getItemStaticU128(key, 2), staticU128[2]);
    assertEq(Dynamics1.getItemStaticAddrs(key, 3), staticAddrs[3]);
    assertEq(Dynamics1.getItemStaticBools(key, 4), staticBools[4]);
    assertEq(Dynamics2.getItemU64(key, 0), u64[0]);
    assertEq(Dynamics2.getItemStr(key, 1), string(abi.encodePacked(bytes(str)[1])));
    assertEq(Dynamics2.getItemB(key, 0), abi.encodePacked(b[0]));

    // test setting single fields
    Dynamics1.setStaticBools(key, staticBools);
    assertEq(abi.encode(Dynamics1.getStaticBools(key)), abi.encode(staticBools));

    Dynamics2.setU64(key, u64);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64));
  }

  function testDynamicsPushAndPop() public {
    Dynamics2.registerSchema();

    bytes32 key = keccak256("key");

    uint64[] memory u64_1 = new uint64[](1);
    u64_1[0] = 123;

    uint64[] memory u64_2 = new uint64[](1);
    u64_2[0] = 456;

    uint64[] memory u64_full = new uint64[](2);
    u64_full[0] = 123;
    u64_full[1] = 456;

    Dynamics2.pushU64(key, 123);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64_1));
    Dynamics2.pushU64(key, 456);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64_full));

    Dynamics2.popU64(key);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64_1));
    Dynamics2.pushU64(key, 456);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64_full));
    Dynamics2.popU64(key);
    assertEq(abi.encode(Dynamics2.getU64(key)), abi.encode(u64_1));
    Dynamics2.popU64(key);
    assertEq(Dynamics2.getU64(key).length, 0);
  }

  function testSingletonSetAndGet() public {
    Singleton.registerSchema();

    Singleton.set(-10, [uint32(1), 2], [uint32(3), 4], [uint32(5)]);
    assertEq(Singleton.getV1(), -10);

    assertEq(abi.encode(Singleton.getV2()), abi.encode([uint32(1), 2]));
    assertEq(Singleton.lengthV2(), 2);
    assertEq(Singleton.getItemV2(0), 1);
    assertEq(Singleton.getItemV2(1), 2);

    assertEq(abi.encode(Singleton.getV3()), abi.encode([uint32(3), 4]));
    assertEq(Singleton.lengthV3(), 2);
    assertEq(Singleton.getItemV3(0), 3);
    assertEq(Singleton.getItemV3(1), 4);

    assertEq(abi.encode(Singleton.getV4()), abi.encode([uint32(5)]));
    assertEq(Singleton.lengthV4(), 1);
    assertEq(Singleton.getItemV4(0), 5);
    assertEq(Singleton.getItemV4(1), 0);
  }

  function testEphemeral() public {
    Ephemeral.registerSchema();

    Ephemeral.emitEphemeral("key", 123);
  }
}
