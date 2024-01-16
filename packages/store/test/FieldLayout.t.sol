// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { FieldLayout, FieldLayoutLib } from "../src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "./FieldLayoutEncodeHelper.sol";
import { MAX_TOTAL_FIELDS, MAX_DYNAMIC_FIELDS } from "../src/constants.sol";

// TODO add tests for all lengths
contract FieldLayoutTest is Test, GasReporter {
  function testEncodeDecodeFieldLayout() public {
    startGasReport("initialize field layout array with 5 entries");
    uint256[] memory _fieldLayout = new uint256[](5);
    _fieldLayout[0] = 1;
    _fieldLayout[1] = 2;
    _fieldLayout[2] = 4;
    _fieldLayout[3] = 16;
    _fieldLayout[4] = 32;
    endGasReport();

    startGasReport("encode field layout with 5+1 entries");
    FieldLayout fieldLayout = FieldLayoutLib.encode(_fieldLayout, 1);
    endGasReport();

    startGasReport("get static byte length at index");
    uint256 staticByteLength = fieldLayout.atIndex(0);
    endGasReport();

    assertEq(staticByteLength, 1);
    assertEq(fieldLayout.atIndex(1), 2);
    assertEq(fieldLayout.atIndex(2), 4);
    assertEq(fieldLayout.atIndex(3), 16);
    assertEq(fieldLayout.atIndex(4), 32);
    assertEq(fieldLayout.atIndex(5), 0);
  }

  function testInvalidFieldLayoutStaticTypeIsZero() public {
    vm.expectRevert(abi.encodeWithSelector(FieldLayoutLib.FieldLayoutLib_StaticLengthIsZero.selector, 1));
    FieldLayoutEncodeHelper.encode(1, 0, 1);
  }

  function testInvalidFieldLayoutStaticTypeDoesNotFitInAWord() public {
    vm.expectRevert(FieldLayoutLib.FieldLayoutLib_StaticLengthDoesNotFitInAWord.selector);
    FieldLayoutEncodeHelper.encode(1, 33, 1);
  }

  function testEncodeMaxValidLength() public {
    uint256[] memory fieldLayout = new uint256[](23);
    fieldLayout[0] = 32;
    fieldLayout[1] = 32;
    fieldLayout[2] = 32;
    fieldLayout[3] = 32;
    fieldLayout[4] = 32;
    fieldLayout[5] = 32;
    fieldLayout[6] = 32;
    fieldLayout[7] = 32;
    fieldLayout[8] = 32;
    fieldLayout[9] = 32;
    fieldLayout[10] = 32;
    fieldLayout[11] = 32;
    fieldLayout[12] = 32;
    fieldLayout[13] = 32;
    fieldLayout[14] = 32;
    fieldLayout[15] = 32;
    fieldLayout[16] = 32;
    fieldLayout[17] = 32;
    fieldLayout[18] = 32;
    fieldLayout[19] = 32;
    fieldLayout[20] = 32;
    fieldLayout[21] = 32;
    fieldLayout[22] = 32;
    FieldLayout encodedFieldLayout = FieldLayoutLib.encode(fieldLayout, MAX_DYNAMIC_FIELDS);

    assertEq(encodedFieldLayout.numStaticFields() + encodedFieldLayout.numDynamicFields(), 28);
  }

  function testEncodeTooLong() public {
    uint256[] memory fieldLayout = new uint256[](17);
    uint256 dynamicFields = 12;
    fieldLayout[0] = 32;
    fieldLayout[1] = 32;
    fieldLayout[2] = 32;
    fieldLayout[3] = 32;
    fieldLayout[4] = 32;
    fieldLayout[5] = 32;
    fieldLayout[6] = 32;
    fieldLayout[7] = 32;
    fieldLayout[8] = 32;
    fieldLayout[9] = 32;
    fieldLayout[10] = 32;
    fieldLayout[11] = 32;
    fieldLayout[12] = 32;
    fieldLayout[13] = 32;
    fieldLayout[14] = 32;
    fieldLayout[15] = 32;
    fieldLayout[16] = 32;
    vm.expectRevert(
      abi.encodeWithSelector(
        FieldLayoutLib.FieldLayoutLib_TooManyFields.selector,
        fieldLayout.length + dynamicFields,
        MAX_TOTAL_FIELDS
      )
    );
    FieldLayoutLib.encode(fieldLayout, dynamicFields);
  }

  function testEncodeMaxValidDynamic() public {
    uint256[] memory fieldLayout = new uint256[](0);
    FieldLayout encodedFieldLayout = FieldLayoutLib.encode(fieldLayout, MAX_DYNAMIC_FIELDS);

    assertEq(encodedFieldLayout.numDynamicFields(), MAX_DYNAMIC_FIELDS);
  }

  function testEncodeTooManyDynamic() public {
    uint256[] memory fieldLayout = new uint256[](0);
    uint256 dynamicFields = 6;
    vm.expectRevert(
      abi.encodeWithSelector(
        FieldLayoutLib.FieldLayoutLib_TooManyDynamicFields.selector,
        fieldLayout.length + dynamicFields,
        MAX_DYNAMIC_FIELDS
      )
    );
    FieldLayoutLib.encode(fieldLayout, dynamicFields);
  }

  function testGetStaticFieldLayoutLength() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get static data length from field layout");
    uint256 length = fieldLayout.staticDataLength();
    endGasReport();

    assertEq(length, 55);
  }

  function testGetNumStaticFields() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of static fields from field layout");
    uint256 num = fieldLayout.numStaticFields();
    endGasReport();

    assertEq(num, 5);
  }

  function testGetNumDynamicFields() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of dynamic fields from field layout");
    uint256 num = fieldLayout.numDynamicFields();
    endGasReport();

    assertEq(num, 1);
  }

  function testGetNumFields() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of all fields from field layout");
    uint256 num = fieldLayout.numFields();
    endGasReport();

    assertEq(num, 6);
  }

  function testValidate() public {
    uint256[] memory fieldLayout = new uint256[](23);
    fieldLayout[0] = 32;
    fieldLayout[1] = 32;
    fieldLayout[2] = 32;
    fieldLayout[3] = 32;
    fieldLayout[4] = 32;
    fieldLayout[5] = 32;
    fieldLayout[6] = 32;
    fieldLayout[7] = 32;
    fieldLayout[8] = 32;
    fieldLayout[9] = 32;
    fieldLayout[10] = 32;
    fieldLayout[11] = 32;
    fieldLayout[12] = 32;
    fieldLayout[13] = 32;
    fieldLayout[14] = 32;
    fieldLayout[15] = 32;
    fieldLayout[16] = 32;
    fieldLayout[17] = 32;
    fieldLayout[18] = 32;
    fieldLayout[19] = 32;
    fieldLayout[20] = 32;
    fieldLayout[21] = 32;
    fieldLayout[22] = 32;
    FieldLayout encodedFieldLayout = FieldLayoutLib.encode(fieldLayout, MAX_DYNAMIC_FIELDS);

    startGasReport("validate field layout");
    encodedFieldLayout.validate();
    endGasReport();
  }

  function testValidateInvalidLayout() public {
    FieldLayout encodedFieldLayout = FieldLayout.wrap(keccak256("some invalid field layout"));

    vm.expectRevert(
      abi.encodeWithSelector(
        FieldLayoutLib.FieldLayoutLib_TooManyDynamicFields.selector,
        encodedFieldLayout.numDynamicFields(),
        MAX_DYNAMIC_FIELDS
      )
    );
    FieldLayout.wrap(keccak256("some invalid field layout")).validate();
  }

  function testIsEmptyTrue() public {
    uint256[] memory fieldLayout = new uint256[](0);
    FieldLayout encodedFieldLayout = FieldLayoutLib.encode(fieldLayout, 0);

    startGasReport("check if field layout is empty (empty field layout)");
    bool empty = encodedFieldLayout.isEmpty();
    endGasReport();

    assertTrue(empty);
  }

  function testIsEmptyFalse() public {
    FieldLayout encodedFieldLayout = FieldLayoutEncodeHelper.encode(32, 0);

    startGasReport("check if field layout is empty (non-empty field layout)");
    bool empty = encodedFieldLayout.isEmpty();
    endGasReport();

    assertFalse(empty);
  }

  function testHex() public {
    uint256[] memory _fieldLayout = new uint256[](24);
    _fieldLayout[0] = 1;
    _fieldLayout[1] = 2;
    _fieldLayout[2] = 3;
    _fieldLayout[3] = 4;
    _fieldLayout[4] = 5;
    _fieldLayout[5] = 6;
    _fieldLayout[6] = 7;
    _fieldLayout[7] = 8;
    _fieldLayout[8] = 9;
    _fieldLayout[9] = 10;
    _fieldLayout[10] = 11;
    _fieldLayout[11] = 12;
    _fieldLayout[12] = 13;
    _fieldLayout[13] = 14;
    _fieldLayout[14] = 15;
    _fieldLayout[15] = 16;
    _fieldLayout[16] = 17;
    _fieldLayout[17] = 18;
    _fieldLayout[18] = 19;
    _fieldLayout[19] = 20;
    _fieldLayout[20] = 21;
    _fieldLayout[21] = 22;
    _fieldLayout[22] = 23;
    _fieldLayout[23] = 32;

    FieldLayout encodedFieldLayout = FieldLayoutLib.encode(_fieldLayout, 4);
    assertEq(encodedFieldLayout.unwrap(), hex"013418040102030405060708090a0b0c0d0e0f10111213141516172000000000");
  }
}
