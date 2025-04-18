// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { Value } from "./codegen/tables/Value.sol";
import { PositionValue } from "./codegen/tables/PositionValue.sol";
import { AddressValue } from "./codegen/tables/AddressValue.sol";
import { ASystemThing, Position } from "./ASystemTypes.sol";
import { THREE } from "./ASystemConstants.sol";

contract ASystem is System {
  function setValue(ASystemThing memory value) external {
    Value.set(value.a);
  }

  function setValue(uint256 value) external {
    Value.set(value);
  }

  function setPosition(Position memory position) external {
    PositionValue.set(position.x, position.y, position.z);
  }

  function setPosition(uint256 x, uint256 y, uint256 z) external {
    PositionValue.set(x, y, z);
  }

  function setPositions(Position[] memory positions) external {
    for (uint256 i = 0; i < positions.length; i++) {
      PositionValue.set(positions[i].x, positions[i].y, positions[i].z);
    }
  }

  function getValue() external view returns (uint256) {
    return Value.get();
  }

  function getTwoValues() external view returns (uint256, uint256) {
    return (Value.get(), Value.get());
  }

  function setAddress() external returns (address) {
    address addr = _msgSender();
    AddressValue.set(addr);
    return addr;
  }

  function setValuesStaticArray(uint256[1] memory values) external {
    Value.set(values[0]);
  }

  function setValuesStaticArray(uint256[2] memory values) external {
    Value.set(values[1]);
  }

  function setValuesStaticArray(uint256[THREE] memory values) external {
    Value.set(values[2]);
  }

  /*
  // TODO: support this case
  // (see flattenTypeName in contractToInterface.ts)
  function setValuesStaticArray(uint256[1 - 0 * 2 + THREE] memory values) external {
    Value.set(values[3]);
  }
  */

  /*
  // TODO: support this case
  function getAddressPayableArray(address payable[] memory array) public pure returns (address payable[] memory) {
    return array;
  }
  */
}
