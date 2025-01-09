// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { ERC20MetadataData } from "../src/codegen/tables/ERC20Metadata.sol";
import { IERC20Errors } from "../src/interfaces/IERC20Errors.sol";
import { IERC20Events } from "../src/interfaces/IERC20Events.sol";
import { MUDERC20 } from "../src/experimental/MUDERC20.sol";
import { Pausable, ERC20Pausable } from "../src/experimental/ERC20Pausable.sol";
import { MockERC20Base, MockERC20WithInternalStore, MockERC20WithWorld, ERC20BehaviorTest, ERC20WithInternalStoreBehaviorTest, ERC20WithWorldBehaviorTest } from "./ERC20BaseTest.t.sol";

// Mock to include mint and burn functions
abstract contract MockERC20Pausable is MUDERC20, ERC20Pausable {
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

contract MockERC20WithInternalStorePausable is MockERC20WithInternalStore, MockERC20Pausable {
  function _update(address from, address to, uint256 value) internal override(MUDERC20, MockERC20Pausable) {
    super._update(from, to, value);
  }
}

contract MockERC20WithWorldPausable is MockERC20WithWorld, MockERC20Pausable {
  function _update(address from, address to, uint256 value) internal override(MUDERC20, MockERC20Pausable) {
    super._update(from, to, value);
  }
}

abstract contract ERC20PausableBehaviorTest is ERC20BehaviorTest {
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

contract ERC20PausableWithInternalStoreTest is ERC20WithInternalStoreBehaviorTest, ERC20PausableBehaviorTest {
  function createToken() internal override returns (MockERC20Base) {
    return new MockERC20WithInternalStorePausable();
  }
}

contract ERC20PausableWithWorldTest is ERC20WithWorldBehaviorTest, ERC20PausableBehaviorTest {
  function createToken() internal override returns (MockERC20Base) {
    return new MockERC20WithWorldPausable();
  }
}
