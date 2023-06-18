// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";

contract StoreTest is Test {
  function startGasReport(string memory name) internal {
    if (bytes(name).length > 32) {
      revert("ctx.startGasReport: Gas report name can't have more than 32 characters");
    }
    bytes32 b32Name = bytes32(bytes(name));
    bytes32 slot = keccak256(bytes("mud.gasReport.name"));
    vm.store(address(vm), slot, b32Name);
    bytes32 valueSlot = keccak256(abi.encodePacked("mud.gasReport", b32Name));
    // warm the slot
    vm.store(address(vm), valueSlot, bytes32(type(uint256).max));
    vm.pauseGasMetering();
    vm.store(address(vm), valueSlot, bytes32(gasleft()));
    vm.resumeGasMetering();
  }

  function endGasReport() internal view {
    uint256 gas = gasleft();
    bytes32 slot = keccak256(bytes("mud.gasReport.name"));
    bytes32 b32Name = vm.load(address(vm), slot);
    bytes32 valueSlot = keccak256(abi.encodePacked("mud.gasReport", b32Name));
    uint256 prevGas = uint256(vm.load(address(vm), valueSlot));
    if (gas > prevGas) {
      revert("ctx.endGasReport: Gas used can't have a negative value");
    }
    console.log(string.concat("gas(", string(abi.encodePacked(b32Name)), "):", vm.toString(prevGas - gas)));
  }
}
