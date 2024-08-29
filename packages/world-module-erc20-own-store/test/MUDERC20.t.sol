// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/Console2.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { MUDERC20 } from "../src/MUDERC20.sol";
import { Token } from "../src/codegen/tables/Token.sol";
import { Balances } from "../src/codegen/tables/Balances.sol";
import { Allowances } from "../src/codegen/tables/Allowances.sol";

contract tokenTest is Test, GasReporter {
  MUDERC20 token;

  address alice = address(0x123);
  address charlie = address(0x456);

  function setUp() public {
    token = new MUDERC20("token", "MUD", address(this), 18);
    StoreSwitch.setStoreAddress(address(token));
  }

  function testTokenSetUp() public {
    startGasReport("token constructor");

    assertTrue(address(token) != address(0));

    assertEq(Token.getDecimals(), 18);
    assertEq(Token.getTotalSupply(), 0);
    assertEq(Token.getName(), "token");
    assertEq(Token.getSymbol(), "MUD");

    endGasReport();
  }

  function testTokenMint() public {
    startGasReport("token mint");

    token.mint(address(this), 1000);

    assertEq(Balances.getBalance(address(this)), 1000);
    assertEq(Token.getTotalSupply(), 1000);

    endGasReport();
  }

  function testTokenMintInvalidCaller() public {
    startGasReport("token mint invalid caller");
    vm.expectRevert();
    vm.prank(alice);
    token.mint(address(alice), 1000);

    endGasReport();
  }

  function testTokenMintToZeroAddress() public {
    startGasReport("token mint to zero address");
    vm.expectRevert();
    token.mint(address(0), 1000);

    endGasReport();
  }

  function testFuzzTokenMint(uint256 mintAmount) public {
    startGasReport("fuzz token mint");

    token.mint(address(this), mintAmount);

    assertEq(Balances.getBalance(address(this)), mintAmount);
    assertEq(Token.getTotalSupply(), mintAmount);

    endGasReport();
  }

  function testTokenBurn() public {
    startGasReport("token burn");

    token.mint(address(this), 1000);
    token.burn(address(this), 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Token.getTotalSupply(), 500);

    endGasReport();
  }

  function testTokenBurnInvalidCaller() public {
    startGasReport("token burn invalid caller");
    vm.expectRevert();
    vm.prank(alice);
    token.burn(address(alice), 1000);

    endGasReport();
  }

  function testTokenBurnZeroAddress() public {
    startGasReport("token burn zero address");
    vm.expectRevert();
    token.burn(address(0), 1000);
    endGasReport();
  }

  function testFuzzTokenBurn(uint256 burnAmount) public {
    startGasReport("fuzz token burn");
    burnAmount = bound(burnAmount, 1, 1000000000);
    token.mint(address(this), 1000000000);

    token.burn(address(this), burnAmount);

    assertEq(Balances.getBalance(address(this)), 1000000000 - burnAmount);
    assertEq(Token.getTotalSupply(), 1000000000 - burnAmount);

    endGasReport();
  }

  function testTokenTransfer() public {
    startGasReport("token transfer");

    token.mint(address(this), 1000);
    token.transfer(alice, 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Balances.getBalance(alice), 500);

    endGasReport();
  }

  function testTokenTransferInsufficientBalance() public {
    startGasReport("token transfer insufficient balance");
    token.mint(address(this), 1000);
    vm.expectRevert();
    token.transfer(alice, 1001);

    endGasReport();
  }

  function testFuzzTransfer(uint256 transferAmount) public {
    startGasReport("fuzz transfer");
    transferAmount = bound(transferAmount, 1, 1000000);
    token.mint(address(this), 1000000);
    token.transfer(alice, transferAmount);

    assertEq(Balances.getBalance(address(this)), 1000000 - transferAmount);
    assertEq(Balances.getBalance(alice), transferAmount);

    endGasReport();
  }

  function testApprove() public {
    startGasReport("token approve");

    token.approve(charlie, 1000);
    assertEq(Allowances.getApproval(address(this), charlie), 1000);

    endGasReport();
  }

  function testTransferFrom() public {
    startGasReport("token transferFrom");

    token.mint(alice, 1000);

    vm.prank(alice);
    token.approve(address(this), 500);

    token.transferFrom(alice, charlie, 500);

    assertEq(Balances.getBalance(alice), 500);
    assertEq(Balances.getBalance(charlie), 500);
    assertEq(Allowances.getApproval(address(this), alice), 0);

    endGasReport();
  }

  function testTransferFromInsufficientAllowance() public {
    startGasReport("token transferFrom insufficient allowance");
    token.mint(address(this), 1000);
    vm.expectRevert();
    token.transferFrom(charlie, alice, 1000);

    endGasReport();
  }

  function testFuzzTransferFrom(uint256 transferAmount) public {
    startGasReport("fuzz transferFrom");
    transferAmount = bound(transferAmount, 1, 1000000);
    token.mint(alice, 1000000);

    vm.prank(alice);
    token.approve(address(this), transferAmount);

    token.transferFrom(alice, charlie, transferAmount);

    assertEq(Balances.getBalance(alice), 1000000 - transferAmount);
    assertEq(Balances.getBalance(charlie), transferAmount);
    assertEq(Allowances.getApproval(address(this), alice), 0);

    endGasReport();
  }

  function testBalanceOf() public {
    startGasReport("token balanceOf");

    token.mint(address(this), 1000);

    assertEq(token.balanceOf(address(this)), 1000);

    endGasReport();
  }
}
