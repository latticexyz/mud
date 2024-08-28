// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { MUDERC20 } from "../src/MUDERC20.sol";
import { Token } from "../src/codegen/tables/Token.sol";
import { Balances } from "../src/codegen/tables/Balances.sol";
import { Allowances } from "../src/codegen/tables/Allowances.sol";

contract MUDERC20Test is Test, GasReporter {
  MUDERC20 muderc20;
  address alice = address(0x123);

  function setUp() public {
    muderc20 = new MUDERC20();
  }

  function testMUDERC20Constructor() public {
    startGasReport("MUDERC20 constructor");

    assertEq(muderc20.decimals(), 18);
    assertEq(muderc20.totalSupply(), 0);
    assertEq(muderc20.name(), "MUDERC20");
    assertEq(muderc20.symbol(), "MUD");

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
    muderc20.transfer(alice, address(0), 500);

    assertEq(Balances.getBalance(address(this)), 500);
    assertEq(Balances.getBalance(alice), 500);

    endGasReport();
  }
}
