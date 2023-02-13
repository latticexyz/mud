// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";

library LibMath {
  function increment(Uint32Component component, uint256 entity) internal {
    uint32 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + 1);
  }
}
