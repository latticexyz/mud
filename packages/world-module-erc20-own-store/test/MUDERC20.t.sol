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

  // ToDo: Add test for minting to address(0)
  // ToDo: Add fuzz test for minting

  function testTokenBurn() public {
    startGasReport("token burn");

    token.mint(address(this), 1000);
    token.burn(address(this), 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Token.getTotalSupply(), 500);

    endGasReport();
  }

  // ToDo: Add test for invalid burning
  // ToDo: Add fuzz test for burning

  function testMUEDERC20Transfer() public {
    startGasReport("token transfer");

    token.mint(address(this), 1000);
    token.transfer(alice, 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Balances.getBalance(alice), 500);

    endGasReport();
  }
}
