// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { Value } from "./codegen/tables/Value.sol";
import { AddressValue } from "./codegen/tables/AddressValue.sol";
import { NameValue } from "./codegen/tables/NameValue.sol";
import { ASystemThing, ASystemThing2 } from "./ASystemTypes.sol";

contract ASystem is System {
  function setComplexValue(ASystemThing2 memory value, string memory name) external {
    Value.set(value.a);
    NameValue.set(name);
  }

  function setValue(ASystemThing memory value) external {
    Value.set(value.a);
  }

  function setValue(uint256 value) external {
    Value.set(value);
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
}
