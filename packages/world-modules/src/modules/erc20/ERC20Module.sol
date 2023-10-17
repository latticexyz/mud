// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Module } from "@latticexyz/world/src/Module.sol";
import { MODULE_NAME } from "./constants.sol";

contract ERC20Module is Module {
  function getName() public pure override returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory args) public {
    revert Module_NonRootInstallNotSupported();
  }

  function installRoot(bytes memory args) public {
    revert Module_RootInstallNotSupported();
  }
}
