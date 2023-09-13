// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { Vm, VmSafe } from "forge-std/Vm.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

contract MudTest is Test {
  address public worldAddress = vm.envOr("WORLD_ADDRESS", address(0));

  function setUp() public virtual {
    if (worldAddress == address(0)) {
      // assign a random anvil.js instance based on the test contract's bytecode, effectively allowing us parallelize tests
      string memory rpcUrl = string.concat(
        "http://127.0.0.1:8545/",
        vm.toString(uint32(uint256(keccak256(address(this).code))))
      );

      console.log("deploying world via", rpcUrl);
      string[] memory deployCommand = new string[](7);
      deployCommand[0] = "pnpm";
      deployCommand[1] = "mud";
      deployCommand[2] = "deploy";
      deployCommand[3] = "--rpc";
      deployCommand[4] = rpcUrl;
      deployCommand[5] = "--saveDeployment";
      deployCommand[6] = "false";

      VmSafe.FfiResult memory deployResult = vm.tryFfi(deployCommand);
      console.log("exit code", vm.toString(deployResult.exit_code));
      console.log("stdout", string(deployResult.stdout));
      console.log("stderr", string(deployResult.stderr));

      // World address is fairly stable when it's the first contract deployed on the node, which should be the case in our tests.
      // TODO: compute world address once we have CREATE2 support
      worldAddress = 0x5FbDB2315678afecb367f032d93F642f64180aa3;
    }

    StoreSwitch.setStoreAddress(worldAddress);
  }
}
