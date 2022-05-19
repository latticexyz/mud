// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract LocalLatticeGameLocator {
  address public localLatticeGameAddress;

  function setLocalLatticeGameAddress(address localLatticeGameAddr) public {
    localLatticeGameAddress = localLatticeGameAddr;
  }
}
