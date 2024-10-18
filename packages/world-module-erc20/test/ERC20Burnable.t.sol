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
import { MUDERC20 } from "../src/MUDERC20.sol";
import { ERC20Burnable } from "../src/ERC20Burnable.sol";
import { MockERC20Base, MockERC20WithInternalStore, MockERC20WithWorld, ERC20BehaviorTest, ERC20WithInternalStoreBehaviorTest, ERC20WithWorldBehaviorTest } from "./ERC20BaseTest.sol";

contract MockERC20WithInternalStoreBurnable is MockERC20WithInternalStore, ERC20Burnable {}

contract MockERC20WithWorldBurnable is MockERC20WithWorld, ERC20Burnable {}

abstract contract ERC20BurnableTest is ERC20BehaviorTest {
  function testBurnByAccount() public {
    token.__mint(address(0xBEEF), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0xBEEF), address(0), 0.9e18);
    startGasReport("burn");
    vm.prank(address(0xBEEF));
    ERC20Burnable(address(token)).burn(0.9e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18 - 0.9e18);
    assertEq(token.balanceOf(address(0xBEEF)), 0.1e18);
  }
}

contract ERC20BurnableWithInternalStoreTest is ERC20WithInternalStoreBehaviorTest, ERC20BurnableTest {
  function createToken() internal override returns (MockERC20Base) {
    return new MockERC20WithInternalStoreBurnable();
  }
}

contract ERC20BurnableWithWorldTest is ERC20WithWorldBehaviorTest, ERC20BurnableTest {
  function createToken() internal override returns (MockERC20Base) {
    return new MockERC20WithWorldBurnable();
  }
}
