// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/Console2.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { MUDERC20 } from "../src/MUDERC20.sol";
import { Token } from "../src/codegen/tables/Token.sol";
import { Balances } from "../src/codegen/tables/Balances.sol";
import { Allowances } from "../src/codegen/tables/Allowances.sol";

contract MUDERC20Test is Test, GasReporter {
  MUDERC20 muderc20;
  address alice = address(0x123);
  address charlie = address(0x456);

  function setUp() public {
    muderc20 = new MUDERC20("MUDERC20", "MUD", 18);
  }

  function testMUDERC20SetUp() public {
    startGasReport("MUDERC20 constructor");

    assertTrue(address(muderc20) != address(0));

    assertEq(Token.getDecimals(), 18);
    assertEq(Token.getTotalSupply(), 0);
    assertEq(Token.getName(), "MUDERC20");
    assertEq(Token.getSymbol(), "MUD");

    endGasReport();
  }

  function testMUDERC20Mint() public {
    startGasReport("MUDERC20 mint");

    muderc20.mint(address(this), 1000);

    assertEq(Balances.getBalance(address(this)), 1000);
    assertEq(Token.getTotalSupply(), 1000);

    endGasReport();
  }

  // ToDo: Add test for invalid minting
  // ToDo: Add test for minting to address(0)
  // ToDo: Add fuzz test for minting

  function testMUDERC20Burn() public {
    startGasReport("MUDERC20 burn");

    muderc20.mint(address(this), 1000);
    muderc20.burn(address(this), 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Token.getTotalSupply(), 500);

    endGasReport();
  }

  // ToDo: Add test for invalid burning
  // ToDo: Add fuzz test for burning

  function testMUEDERC20Transfer() public {
    startGasReport("MUDERC20 transfer");

    muderc20.mint(address(this), 1000);
    muderc20.transfer(alice, 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Balances.getBalance(alice), 500);

    endGasReport();
  }
}
