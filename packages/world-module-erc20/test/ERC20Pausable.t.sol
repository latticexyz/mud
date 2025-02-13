// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { ERC20MetadataData } from "../src/codegen/tables/ERC20Metadata.sol";
import { IERC20Errors } from "../src/interfaces/IERC20Errors.sol";
import { IERC20Events } from "../src/interfaces/IERC20Events.sol";
import { MUDERC20 } from "../src/experimental/MUDERC20.sol";
import { Pausable, ERC20Pausable } from "../src/experimental/ERC20Pausable.sol";
import { MockERC20Base, ERC20BehaviorTest, namespace, pausedId } from "./ERC20BaseTest.t.sol";

// Mock to include mint and burn functions
contract MockERC20Pausable is MockERC20Base, ERC20Pausable(pausedId) {
  constructor(IBaseWorld world) MockERC20Base(world) {}

  function initialize() public override {
    super.initialize();
    _Pausable_init();
  }

  function pause() public {
    _pause();
  }

  function unpause() public {
    _unpause();
  }

  function _update(address from, address to, uint256 value) internal virtual override(MUDERC20, ERC20Pausable) {
    super._update(from, to, value);
  }
}

contract ERC20PausableTest is ERC20BehaviorTest {
  function createToken(IBaseWorld world) internal override returns (MockERC20Base) {
    return new MockERC20Pausable(world);
  }

  function testPause() public {
    startGasReportWithPrefix("pause");
    MockERC20Pausable(address(token)).pause();
    endGasReport();

    vm.expectRevert(abi.encodeWithSelector(Pausable.EnforcedPause.selector));
    token.transfer(address(0xBEEF), 0);

    startGasReportWithPrefix("unpause");
    MockERC20Pausable(address(token)).unpause();
    endGasReport();

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(this), address(0xBEEF), 0);
    token.transfer(address(0xBEEF), 0);
  }
}
