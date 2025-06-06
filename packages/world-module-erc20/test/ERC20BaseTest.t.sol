// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldConsumer } from "@latticexyz/world-consumer/src/experimental/WorldConsumer.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { ERC20Metadata } from "../src/codegen/tables/ERC20Metadata.sol";
import { TotalSupply } from "../src/codegen/tables/TotalSupply.sol";
import { Balances } from "../src/codegen/tables/Balances.sol";
import { Allowances } from "../src/codegen/tables/Allowances.sol";
import { Paused } from "../src/codegen/tables/Paused.sol";

import { IERC20 } from "../src/interfaces/IERC20.sol";
import { IERC20Metadata } from "../src/interfaces/IERC20Metadata.sol";
import { IERC20Errors } from "../src/interfaces/IERC20Errors.sol";
import { IERC20Events } from "../src/interfaces/IERC20Events.sol";
import { MUDERC20 } from "../src/experimental/MUDERC20.sol";

bytes14 constant namespace = "mockerc20ns";

ResourceId constant totalSupplyId = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, namespace, bytes16("TotalSupply")))
);
ResourceId constant balancesId = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, namespace, bytes16("Balances")))
);
ResourceId constant allowancesId = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, namespace, bytes16("Allowances")))
);
ResourceId constant metadataId = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, namespace, bytes16("Metadata")))
);
ResourceId constant pausedId = ResourceId.wrap(bytes32(abi.encodePacked(RESOURCE_TABLE, namespace, bytes16("Paused"))));

// Mock to include mint and burn functions
contract MockERC20Base is MUDERC20 {
  constructor(IBaseWorld world) WorldConsumer(world) MUDERC20(totalSupplyId, balancesId, allowancesId, metadataId) {}

  function initialize() public virtual {
    _MUDERC20_init("Token", "TKN");
  }

  function __mint(address to, uint256 amount) public {
    _mint(to, amount);
  }

  function __burn(address from, uint256 amount) public {
    _burn(from, amount);
  }
}

abstract contract ERC20BehaviorTest is Test, GasReporter, IERC20Events, IERC20Errors {
  MockERC20Base token;

  function createToken(IBaseWorld world) internal virtual returns (MockERC20Base);

  // Used for validating the addresses in fuzz tests
  function validAddress(address addr) internal view returns (bool) {
    return addr != address(0) && addr != StoreSwitch.getStoreAddress();
  }

  // TODO: startGasReport should be marked virtual so we can override
  function startGasReportWithPrefix(string memory name) internal {
    startGasReport(reportNameWithPrefix(name));
  }

  function reportNameWithPrefix(string memory name) private pure returns (string memory) {
    string memory prefix = "world_";
    return string.concat(prefix, name);
  }

  function setUp() public {
    IBaseWorld world = createWorld();

    StoreSwitch.setStoreAddress(address(world));

    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    world.registerNamespace(namespaceId);

    // Register each table
    TotalSupply.register(totalSupplyId);
    Balances.register(balancesId);
    Allowances.register(allowancesId);
    ERC20Metadata.register(metadataId);
    Paused.register(pausedId);

    token = createToken(world);

    world.grantAccess(namespaceId, address(token));

    token.initialize();
  }

  function testSetUp() public {
    assertTrue(address(token) != address(0));
  }

  /////////////////////////////////////////////////
  // SOLADY ERC20 TEST CASES
  // (https://github.com/Vectorized/solady/blob/main/test/ERC20.t.sol)
  /////////////////////////////////////////////////

  function testMetadata() public {
    assertEq(token.name(), "Token");
    assertEq(token.symbol(), "TKN");
    assertEq(token.decimals(), 18);
  }

  function testMint() public {
    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0), address(0xBEEF), 1e18);
    startGasReportWithPrefix("mint");
    token.__mint(address(0xBEEF), 1e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testBurn() public {
    token.__mint(address(0xBEEF), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0xBEEF), address(0), 0.9e18);
    startGasReportWithPrefix("burn");
    token.__burn(address(0xBEEF), 0.9e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18 - 0.9e18);
    assertEq(token.balanceOf(address(0xBEEF)), 0.1e18);
  }

  function testApprove() public {
    vm.expectEmit(true, true, true, true);
    emit Approval(address(this), address(0xBEEF), 1e18);
    startGasReportWithPrefix("approve");
    bool success = token.approve(address(0xBEEF), 1e18);
    endGasReport();
    assertTrue(success);

    assertEq(token.allowance(address(this), address(0xBEEF)), 1e18);
  }

  function testTransfer() public {
    token.__mint(address(this), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(this), address(0xBEEF), 1e18);
    startGasReportWithPrefix("transfer");
    bool success = token.transfer(address(0xBEEF), 1e18);
    endGasReport();
    assertTrue(success);
    assertEq(token.totalSupply(), 1e18);

    assertEq(token.balanceOf(address(this)), 0);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testTransferFrom() public {
    address from = address(0xABCD);

    token.__mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(from, address(0xBEEF), 1e18);
    startGasReportWithPrefix("transferFrom");
    bool success = token.transferFrom(from, address(0xBEEF), 1e18);
    endGasReport();
    assertTrue(success);
    assertEq(token.totalSupply(), 1e18);

    assertEq(token.allowance(from, address(this)), 0);

    assertEq(token.balanceOf(from), 0);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testInfiniteApproveTransferFrom() public {
    address from = address(0xABCD);

    token.__mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), type(uint256).max);

    assertTrue(token.transferFrom(from, address(0xBEEF), 1e18));
    assertEq(token.totalSupply(), 1e18);

    assertEq(token.allowance(from, address(this)), type(uint256).max);

    assertEq(token.balanceOf(from), 0);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testMintOverMaxUintReverts() public {
    token.__mint(address(this), type(uint256).max);
    vm.expectRevert();
    token.__mint(address(this), 1);
  }

  function testTransferInsufficientBalanceReverts() public {
    token.__mint(address(this), 0.9e18);
    vm.expectRevert(
      abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(this), 0.9e18, 1e18)
    );
    token.transfer(address(0xBEEF), 1e18);
  }

  function testTransferFromInsufficientAllowanceReverts() public {
    address from = address(0xABCD);

    token.__mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), 0.9e18);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientAllowance.selector, address(this), 0.9e18, 1e18));
    token.transferFrom(from, address(0xBEEF), 1e18);
  }

  function testTransferFromInsufficientBalanceReverts() public {
    address from = address(0xABCD);

    token.__mint(from, 0.9e18);

    vm.prank(from);
    token.approve(address(this), 1e18);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, from, 0.9e18, 1e18));
    token.transferFrom(from, address(0xBEEF), 1e18);
  }

  function testMint(address to, uint256 amount) public {
    vm.assume(validAddress(to));

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0), to, amount);
    token.__mint(to, amount);

    assertEq(token.totalSupply(), amount);
    assertEq(token.balanceOf(to), amount);
  }

  function testBurn(address from, uint256 mintAmount, uint256 burnAmount) public {
    vm.assume(validAddress(from));
    vm.assume(burnAmount <= mintAmount);

    token.__mint(from, mintAmount);
    vm.expectEmit(true, true, true, true);
    emit Transfer(from, address(0), burnAmount);
    token.__burn(from, burnAmount);

    assertEq(token.totalSupply(), mintAmount - burnAmount);
    assertEq(token.balanceOf(from), mintAmount - burnAmount);
  }

  function testApprove(address to, uint256 amount) public {
    vm.assume(validAddress(to));

    assertTrue(token.approve(to, amount));

    assertEq(token.allowance(address(this), to), amount);
  }

  function testTransfer(address to, uint256 amount) public {
    vm.assume(validAddress(to));
    token.__mint(address(this), amount);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(this), to, amount);
    assertTrue(token.transfer(to, amount));
    assertEq(token.totalSupply(), amount);

    if (address(this) == to) {
      assertEq(token.balanceOf(address(this)), amount);
    } else {
      assertEq(token.balanceOf(address(this)), 0);
      assertEq(token.balanceOf(to), amount);
    }
  }

  function testTransferFrom(address spender, address from, address to, uint256 approval, uint256 amount) public {
    vm.assume(validAddress(from));
    vm.assume(validAddress(to));
    vm.assume(validAddress(spender));
    vm.assume(amount <= approval);

    token.__mint(from, amount);
    assertEq(token.balanceOf(from), amount);

    vm.prank(from);
    token.approve(spender, approval);

    vm.expectEmit(true, true, true, true);
    emit Transfer(from, to, amount);
    vm.prank(spender);
    assertTrue(token.transferFrom(from, to, amount));
    assertEq(token.totalSupply(), amount);

    if (approval == type(uint256).max) {
      assertEq(token.allowance(from, spender), approval);
    } else {
      assertEq(token.allowance(from, spender), approval - amount);
    }

    if (from == to) {
      assertEq(token.balanceOf(from), amount);
    } else {
      assertEq(token.balanceOf(from), 0);
      assertEq(token.balanceOf(to), amount);
    }
  }

  function testBurnInsufficientBalanceReverts(address to, uint256 mintAmount, uint256 burnAmount) public {
    vm.assume(validAddress(to));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(burnAmount > mintAmount);

    token.__mint(to, mintAmount);
    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, to, mintAmount, burnAmount));
    token.__burn(to, burnAmount);
  }

  function testTransferInsufficientBalanceReverts(address to, uint256 mintAmount, uint256 sendAmount) public {
    vm.assume(validAddress(to));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(sendAmount > mintAmount);

    token.__mint(address(this), mintAmount);
    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, address(this), mintAmount, sendAmount));
    token.transfer(to, sendAmount);
  }

  function testTransferFromInsufficientAllowanceReverts(address to, uint256 approval, uint256 amount) public {
    vm.assume(validAddress(to));
    vm.assume(approval < type(uint256).max);
    vm.assume(amount > approval);

    address from = address(0xABCD);

    token.__mint(from, amount);

    vm.prank(from);
    token.approve(address(this), approval);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientAllowance.selector, address(this), approval, amount));
    token.transferFrom(from, to, amount);
  }

  function testTransferFromInsufficientBalanceReverts(address to, uint256 mintAmount, uint256 sendAmount) public {
    vm.assume(validAddress(to));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(sendAmount > mintAmount);

    address from = address(0xABCD);

    token.__mint(from, mintAmount);

    vm.prank(from);
    token.approve(address(this), sendAmount);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, from, mintAmount, sendAmount));
    token.transferFrom(from, to, sendAmount);
  }

  function testNamespaceAccess() public {
    assertTrue(ResourceAccess.get(WorldResourceIdLib.encodeNamespace(namespace), address(token)));
  }
}

// Concrete tests for basic namespace ERC20 behavior
contract ERC20Test is ERC20BehaviorTest {
  function createToken(IBaseWorld world) internal virtual override returns (MockERC20Base) {
    return new MockERC20Base(world);
  }
}
