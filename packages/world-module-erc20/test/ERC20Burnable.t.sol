// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";

import { ERC20MetadataData } from "../src/codegen/tables/ERC20Metadata.sol";
import { IERC20Errors } from "../src/interfaces/IERC20Errors.sol";
import { IERC20Events } from "../src/interfaces/IERC20Events.sol";
import { MUDERC20 } from "../src/experimental/MUDERC20.sol";
import { ERC20Burnable } from "../src/experimental/ERC20Burnable.sol";
import { MockERC20Base, ERC20BehaviorTest } from "./ERC20BaseTest.t.sol";

contract MockERC20Burnable is MockERC20Base, ERC20Burnable {
  constructor(IBaseWorld world) MockERC20Base(world) {}
}

contract ERC20BurnableTest is ERC20BehaviorTest {
  function createToken(IBaseWorld world) internal override returns (MockERC20Base) {
    return new MockERC20Burnable(world);
  }

  function testBurnByAccount() public {
    token.__mint(address(0xBEEF), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0xBEEF), address(0), 0.9e18);
    startGasReportWithPrefix("burn");
    vm.prank(address(0xBEEF));
    ERC20Burnable(address(token)).burn(0.9e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18 - 0.9e18);
    assertEq(token.balanceOf(address(0xBEEF)), 0.1e18);
  }
}
