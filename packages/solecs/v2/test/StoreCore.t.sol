// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { StoreCore } from "../StoreCore.sol";
import { Utils } from "../Utils.sol";
import { Bytes } from "../Bytes.sol";
import { SchemaType } from "../Types.sol";

contract StoreCoreTest is DSTestPlus {
  function testSetAndGetDataRawOneSlot() public {
    bytes32 location = keccak256("some location");
    bytes memory data = new bytes(32);

    data[0] = 0x01;
    data[31] = 0x02;

    uint256 gas = gasleft();
    StoreCore._setDataRaw(location, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    gas = gasleft();
    bytes memory loadedData = StoreCore._getDataRaw(location, data.length);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertEq(bytes32(loadedData), bytes32(data));
  }

  function testSetAndGetDataRawMultipleSlots() public {
    bytes32 location = keccak256("some location");
    bytes memory data = abi.encode("this is some data spanning multiple words");

    uint256 gas = gasleft();
    StoreCore._setDataRaw(location, data);
    gas = gas - gasleft();
    console.log("gas used (set, %s slots): %s", Utils.divCeil(data.length, 32), gas);

    gas = gasleft();
    bytes memory loadedData = StoreCore._getDataRaw(location, data.length);
    gas = gas - gasleft();
    console.log("gas used (get, warm, %s slots): %s", Utils.divCeil(data.length, 32), gas);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testRegisterAndGetSchema() public {
    SchemaType[] memory schema = new SchemaType[](4);
    schema[0] = SchemaType.Uint8;
    schema[1] = SchemaType.Uint16;
    schema[2] = SchemaType.Uint8;
    schema[3] = SchemaType.Uint16;

    bytes32 table = keccak256("some.table");
    uint256 gas = gasleft();
    StoreCore.registerSchema(table, schema);
    gas = gas - gasleft();
    console.log("gas used (register): %s", gas);

    gas = gasleft();
    SchemaType[] memory loadedSchema = StoreCore.getSchema(table);
    gas = gas - gasleft();
    console.log("gas used (get schema, warm): %s", gas);

    assertEq(loadedSchema.length, schema.length);
    assertEq(uint8(schema[0]), uint8(loadedSchema[0]));
    assertEq(uint8(schema[1]), uint8(loadedSchema[1]));
    assertEq(uint8(schema[2]), uint8(loadedSchema[2]));
    assertEq(uint8(schema[3]), uint8(loadedSchema[3]));
  }

  function testSplit() public {
    SchemaType[] memory schema = new SchemaType[](2);
    schema[0] = SchemaType.Uint8;
    schema[1] = SchemaType.Uint16;

    bytes memory data = bytes.concat(bytes1(0x01), bytes2(0x0203));

    uint256 gas = gasleft();
    bytes[] memory splitData = StoreCore._split(data, schema);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(splitData.length, schema.length);
    assertEq(uint8(bytes1(splitData[0])), 0x01);
    assertEq(uint16(bytes2(splitData[1])), 0x0203);
  }

  function testSetAndGetAndSplitData() public {
    // Register table's schema
    SchemaType[] memory schema = new SchemaType[](4);
    schema[0] = SchemaType.Uint8;
    schema[1] = SchemaType.Uint16;
    schema[2] = SchemaType.Uint8;
    schema[3] = SchemaType.Uint16;
    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema);

    // Set data
    bytes memory data = bytes.concat(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    uint256 gas = gasleft();
    uint256 length = StoreCore._getByteLength(schema);
    gas = gas - gasleft();
    console.log("gas used (compute schema length): %s", gas);

    gas = gasleft();
    StoreCore.setData(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.getData(table, key, length);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    // Split data
    gas = gasleft();
    bytes[] memory splitData = StoreCore._split(data, schema);
    gas = gas - gasleft();
    console.log("gas used (split): %s", gas);

    assertEq(loadedData.length, data.length);
    assertEq(uint8(bytes1(splitData[0])), 0x01);
    assertEq(uint16(bytes2(splitData[1])), 0x0203);
    assertEq(uint8(bytes1(splitData[2])), 0x04);
    assertEq(uint16(bytes2(splitData[3])), 0x0506);
  }
}
