// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { ERC20Module } from "../src/modules/erc20-puppet/ERC20Module.sol";
import { MetadataData } from "../src/modules/erc20-puppet/tables/Metadata.sol";
import { ERC20Registry } from "../src/modules/erc20-puppet/tables/ERC20Registry.sol";
import { ERC20_REGISTRY_TABLE_ID } from "../src/modules/erc20-puppet/constants.sol";
import { IERC20Events } from "../src/modules/erc20-puppet/IERC20Events.sol";
import { IERC20Mintable } from "../src/modules/erc20-puppet/IERC20Mintable.sol";
import { IERC20Errors } from "../src/modules/erc20-puppet/IERC20Errors.sol";
import { registerERC20 } from "../src/modules/erc20-puppet/registerERC20.sol";

contract ERC20Test is Test, GasReporter, IERC20Events, IERC20Errors {
  IBaseWorld world;
  ERC20Module erc20Module;
  IERC20Mintable token;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    StoreSwitch.setStoreAddress(address(world));

    // Register a new ERC20 token
    token = registerERC20(world, "myERC20", MetadataData({ decimals: 18, name: "Token", symbol: "TKN" }));
  }

  function testSetUp() public {
    assertTrue(address(token) != address(0));
    assertEq(NamespaceOwner.get(WorldResourceIdLib.encodeNamespace("myERC20")), address(this));
  }

  function testInstallTwice() public {
    // Install the ERC20 module
    IERC20Mintable anotherToken = registerERC20(
      world,
      "anotherERC20",
      MetadataData({ decimals: 18, name: "Token", symbol: "TKN" })
    );
    assertTrue(address(anotherToken) != address(0));
    assertTrue(address(anotherToken) != address(token));
  }

  /////////////////////////////////////////////////
  // SOLADY ERC20 TEST CAES
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
    startGasReport("mint");
    token.mint(address(0xBEEF), 1e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testBurn() public {
    token.mint(address(0xBEEF), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0xBEEF), address(0), 0.9e18);
    startGasReport("burn");
    token.burn(address(0xBEEF), 0.9e18);
    endGasReport();

    assertEq(token.totalSupply(), 1e18 - 0.9e18);
    assertEq(token.balanceOf(address(0xBEEF)), 0.1e18);
  }

  function testApprove() public {
    vm.expectEmit(true, true, true, true);
    emit Approval(address(this), address(0xBEEF), 1e18);
    startGasReport("approve");
    bool success = token.approve(address(0xBEEF), 1e18);
    endGasReport();
    assertTrue(success);

    assertEq(token.allowance(address(this), address(0xBEEF)), 1e18);
  }

  function testTransfer() public {
    token.mint(address(this), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(this), address(0xBEEF), 1e18);
    startGasReport("transfer");
    bool success = token.transfer(address(0xBEEF), 1e18);
    endGasReport();
    assertTrue(success);
    assertEq(token.totalSupply(), 1e18);

    assertEq(token.balanceOf(address(this)), 0);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testTransferFrom() public {
    address from = address(0xABCD);

    token.mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), 1e18);

    vm.expectEmit(true, true, true, true);
    emit Transfer(from, address(0xBEEF), 1e18);
    startGasReport("transferFrom");
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

    token.mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), type(uint256).max);

    assertTrue(token.transferFrom(from, address(0xBEEF), 1e18));
    assertEq(token.totalSupply(), 1e18);

    assertEq(token.allowance(from, address(this)), type(uint256).max);

    assertEq(token.balanceOf(from), 0);
    assertEq(token.balanceOf(address(0xBEEF)), 1e18);
  }

  function testMintOverMaxUintReverts() public {
    token.mint(address(this), type(uint256).max);
    vm.expectRevert();
    token.mint(address(this), 1);
  }

  function testTransferInsufficientBalanceReverts() public {
    token.mint(address(this), 0.9e18);
    vm.expectRevert(
      abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(this), 0.9e18, 1e18)
    );
    token.transfer(address(0xBEEF), 1e18);
  }

  function testTransferFromInsufficientAllowanceReverts() public {
    address from = address(0xABCD);

    token.mint(from, 1e18);

    vm.prank(from);
    token.approve(address(this), 0.9e18);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientAllowance.selector, address(this), 0.9e18, 1e18));
    token.transferFrom(from, address(0xBEEF), 1e18);
  }

  function testTransferFromInsufficientBalanceReverts() public {
    address from = address(0xABCD);

    token.mint(from, 0.9e18);

    vm.prank(from);
    token.approve(address(this), 1e18);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, from, 0.9e18, 1e18));
    token.transferFrom(from, address(0xBEEF), 1e18);
  }

  function testMint(address to, uint256 amount) public {
    vm.assume(to != address(0));

    vm.expectEmit(true, true, true, true);
    emit Transfer(address(0), to, amount);
    token.mint(to, amount);

    assertEq(token.totalSupply(), amount);
    assertEq(token.balanceOf(to), amount);
  }

  function testBurn(address from, uint256 mintAmount, uint256 burnAmount) public {
    vm.assume(from != address(0));
    vm.assume(burnAmount <= mintAmount);

    token.mint(from, mintAmount);
    vm.expectEmit(true, true, true, true);
    emit Transfer(from, address(0), burnAmount);
    token.burn(from, burnAmount);

    assertEq(token.totalSupply(), mintAmount - burnAmount);
    assertEq(token.balanceOf(from), mintAmount - burnAmount);
  }

  function testApprove(address to, uint256 amount) public {
    vm.assume(to != address(0));

    assertTrue(token.approve(to, amount));

    assertEq(token.allowance(address(this), to), amount);
  }

  function testTransfer(address to, uint256 amount) public {
    vm.assume(to != address(0));
    token.mint(address(this), amount);

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
    vm.assume(from != address(0));
    vm.assume(to != address(0));
    vm.assume(spender != address(0));
    vm.assume(amount <= approval);

    token.mint(from, amount);
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
    vm.assume(to != address(0));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(burnAmount > mintAmount);

    token.mint(to, mintAmount);
    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, to, mintAmount, burnAmount));
    token.burn(to, burnAmount);
  }

  function testTransferInsufficientBalanceReverts(address to, uint256 mintAmount, uint256 sendAmount) public {
    vm.assume(to != address(0));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(sendAmount > mintAmount);

    token.mint(address(this), mintAmount);
    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, address(this), mintAmount, sendAmount));
    token.transfer(to, sendAmount);
  }

  function testTransferFromInsufficientAllowanceReverts(address to, uint256 approval, uint256 amount) public {
    vm.assume(to != address(0));
    vm.assume(approval < type(uint256).max);
    vm.assume(amount > approval);

    address from = address(0xABCD);

    token.mint(from, amount);

    vm.prank(from);
    token.approve(address(this), approval);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientAllowance.selector, address(this), approval, amount));
    token.transferFrom(from, to, amount);
  }

  function testTransferFromInsufficientBalanceReverts(address to, uint256 mintAmount, uint256 sendAmount) public {
    vm.assume(to != address(0));
    vm.assume(mintAmount < type(uint256).max);
    vm.assume(sendAmount > mintAmount);

    address from = address(0xABCD);

    token.mint(from, mintAmount);

    vm.prank(from);
    token.approve(address(this), sendAmount);

    vm.expectRevert(abi.encodeWithSelector(ERC20InsufficientBalance.selector, from, mintAmount, sendAmount));
    token.transferFrom(from, to, sendAmount);
  }
}
