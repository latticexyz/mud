// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";

//common utilities for forge tests
contract Utilities is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);
  bytes32 internal nextUser = keccak256(abi.encodePacked("user address"));

  function getNextUserAddress() external returns (address payable) {
    //bytes32 to address conversion
    address payable user = payable(address(uint160(uint256(nextUser))));
    nextUser = keccak256(abi.encodePacked(nextUser));
    return user;
  }

  //create users with 100 ether balance
  function createUsers(uint256 userNum) external returns (address payable[] memory) {
    address payable[] memory users = new address payable[](userNum);
    for (uint256 i = 0; i < userNum; i++) {
      address payable user = this.getNextUserAddress();
      vm.deal(user, 100 ether);
      users[i] = user;
    }
    return users;
  }

  //move block.number forward by a given number of blocks
  function mineBlocks(uint256 numBlocks) external {
    uint256 targetBlock = block.number + numBlocks;
    vm.roll(targetBlock);
  }
}
