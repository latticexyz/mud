// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

import { Store } from "../src/Store.sol";
import { ERC20 } from "../src/ERC20.sol";
import { Token } from "../src/codegen/tables/Token.sol";
import { Balances } from "../src/codegen/tables/Balances.sol";
import { Allowances } from "../src/codegen/tables/Allowances.sol";

contract TokenTest is Test, GasReporter {
  ERC20 token;
  Store store;
  ResourceId tokenTableId;

  address alice = address(0x123);
  address charlie = address(0x456);

  function setUp() public {
    startGasReport("token constructor");
    store = new Store();
    token = new ERC20("token", "MUD", address(this), address(store), 18);
    endGasReport();
    bytes memory symbolAsBytes = bytes("MUD");
    require(symbolAsBytes.length > 0 && symbolAsBytes.length <= 30, "ERC20: symbol length too long");
    bytes30 symbolAsBytes30 = bytes30(symbolAsBytes);

    tokenTableId = ResourceIdLib.encode({
      typeId: RESOURCE_TABLE, // onchain table
      name: symbolAsBytes30
    });

    StoreSwitch.setStoreAddress(address(store));
  }

  function testTokenSetUp() public {
    assertTrue(address(token) != address(0));

    assertEq(token.decimals(), 18);
    assertEq(token.totalSupply(), 0);
    assertEq(token.name(), "token");
    assertEq(token.symbol(), "MUD");

    //assertEq(Token.getDecimals(tokenTableId), 18);
    //assertEq(Token.getTotalSupply(tokenTableId), 0);
    //assertEq(Token.getName(tokenTableId), "token");
    //assertEq(Token.getSymbol(tokenTableId), "MUD");
  }

  function testTokenMint() public {
    startGasReport("token mint");
    token.mint(address(this), 1000);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), 1000);
    assertEq(token.totalSupply(), 1000);
  }

  function testTokenMintInvalidCaller() public {
    vm.expectRevert();
    vm.prank(alice);
    startGasReport("token mint invalid caller");
    token.mint(address(alice), 1000);
    endGasReport();
  }

  function testTokenMintToZeroAddress() public {
    vm.expectRevert();
    startGasReport("token mint to zero address");
    token.mint(address(0), 1000);
    endGasReport();
  }

  function testFuzzTokenMint(uint256 mintAmount) public {
    startGasReport("fuzz token mint");
    token.mint(address(this), mintAmount);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), mintAmount);
    assertEq(token.totalSupply(), mintAmount);
  }

  function testTokenBurn() public {
    token.mint(address(this), 1000);
    startGasReport("token burn");
    token.burn(address(this), 500);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), 500);
    assertEq(token.totalSupply(), 500);
  }

  function testTokenBurnInvalidCaller() public {
    vm.expectRevert();
    vm.prank(alice);
    startGasReport("token burn invalid caller");
    token.burn(address(alice), 1000);
    endGasReport();
  }

  function testTokenBurnZeroAddress() public {
    vm.expectRevert();
    startGasReport("token burn zero address");
    token.burn(address(0), 1000);
    endGasReport();
  }

  function testFuzzTokenBurn(uint256 burnAmount) public {
    burnAmount = bound(burnAmount, 1, 1000000000);
    token.mint(address(this), 1000000000);

    startGasReport("fuzz token burn");
    token.burn(address(this), burnAmount);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), 1000000000 - burnAmount);
    assertEq(token.totalSupply(), 1000000000 - burnAmount);
  }

  function testTokenTransfer() public {
    token.mint(address(this), 1000);

    startGasReport("token transfer");
    token.transfer(alice, 500);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), 500);
    assertEq(Balances.getBalance(address(token), alice), 500);
  }

  function testTokenTransferInsufficientBalance() public {
    token.mint(address(this), 1000);
    vm.expectRevert();

    startGasReport("token transfer insufficient balance");
    token.transfer(alice, 1001);
    endGasReport();
  }

  function testFuzzTransfer(uint256 transferAmount) public {
    transferAmount = bound(transferAmount, 1, 1000000);
    token.mint(address(this), 1000000);

    startGasReport("fuzz transfer");
    token.transfer(alice, transferAmount);
    endGasReport();

    assertEq(Balances.getBalance(address(token), address(this)), 1000000 - transferAmount);
    assertEq(Balances.getBalance(address(token), alice), transferAmount);
  }

  function testApprove() public {
    startGasReport("token approve");
    token.approve(charlie, 1000);
    endGasReport();

    assertEq(Allowances.getApproval(address(token), address(this), charlie), 1000);
  }

  function testTransferFrom() public {
    token.mint(alice, 1000);

    vm.prank(alice);
    token.approve(address(this), 500);

    startGasReport("token transferFrom");
    token.transferFrom(alice, charlie, 500);
    endGasReport();

    assertEq(Balances.getBalance(address(token), alice), 500);
    assertEq(Balances.getBalance(address(token), charlie), 500);
    assertEq(Allowances.getApproval(address(token), address(this), alice), 0);
  }

  function testTransferFromInsufficientAllowance() public {
    token.mint(address(this), 1000);
    vm.expectRevert();

    startGasReport("token transferFrom insufficient allowance");
    token.transferFrom(charlie, alice, 1000);
    endGasReport();
  }

  function testFuzzTransferFrom(uint256 transferAmount) public {
    transferAmount = bound(transferAmount, 1, 1000000);
    token.mint(alice, 1000000);

    vm.prank(alice);
    token.approve(address(this), transferAmount);

    startGasReport("fuzz transferFrom");
    token.transferFrom(alice, charlie, transferAmount);
    endGasReport();

    assertEq(Balances.getBalance(address(token), alice), 1000000 - transferAmount);
    assertEq(Balances.getBalance(address(token), charlie), transferAmount);
    assertEq(Allowances.getApproval(address(token), address(this), alice), 0);
  }

  function testBalanceOf() public {
    token.mint(address(this), 1000);
    assertEq(token.balanceOf(address(this)), 1000);
  }
}
