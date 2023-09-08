// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { Vm, VmSafe } from "forge-std/Vm.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

contract MudTest is Test {
  address public worldAddress = vm.envOr("WORLD_ADDRESS", address(0));
  // TODO: figure out how to uniquely identify this among other tests, or run tests in series rather than parallel, to avoid anvil nonce issues
  VmSafe.Wallet public deployer = vm.createWallet("deployer");

  function setUp() public virtual {
    if (worldAddress == address(0)) {
      // worldAddress = vm.deployContract("World");
      // vm.setEnvAddress("WORLD_ADDRESS", worldAddress);
      console.log("deploying world");

      console.log("setting deployer private key", vm.toString(bytes32(deployer.privateKey)));
      vm.setEnv("PRIVATE_KEY", vm.toString(bytes32(deployer.privateKey)));
      string[] memory deployCommand = new string[](5);
      deployCommand[0] = "pnpm";
      deployCommand[1] = "mud";
      deployCommand[2] = "deploy";
      deployCommand[3] = "--saveDeployment";
      deployCommand[4] = "false";

      VmSafe.FfiResult memory result = vm.tryFfi(deployCommand);
      console.log("exit code", vm.toString(result.exit_code));
      console.log("stdout", string(result.stdout));
      console.log("stderr", string(result.stderr));

      revert("nope");
    }
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
    StoreSwitch.setStoreAddress(worldAddress);
  }
}
