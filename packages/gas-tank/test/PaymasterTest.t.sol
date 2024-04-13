// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/core/EntryPointSimulations.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/samples/SimpleAccountFactory.sol";

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { Unstable_CallWithSignatureSystem } from "@latticexyz/world-modules/src/modules/callwithsignature/Unstable_CallWithSignatureModule.sol";
import { getSignedMessageHash } from "@latticexyz/world-modules/src/modules/callwithsignature/getSignedMessageHash.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { EntryPoint as EntryPointTable } from "../src/codegen/tables/EntryPoint.sol";
import { PAYMASTER_SYSTEM_ID } from "../src/PaymasterSystem.sol";

import { TestCounter } from "./utils/TestCounter.sol";
import { BytesLib } from "./utils/BytesLib.sol";

using ECDSA for bytes32;

contract PaymasterTest is MudTest {
  EntryPoint entryPoint;
  EntryPointSimulations entryPointSimulations;
  SimpleAccountFactory accountFactory;
  IWorld paymaster;
  TestCounter counter;

  address payable beneficiary;
  address paymasterOperator;
  address user;
  uint256 userKey;
  address guarantor;
  uint256 guarantorKey;
  SimpleAccount account;

  function setUp() public override {
    super.setUp();

    beneficiary = payable(makeAddr("beneficiary"));
    paymasterOperator = makeAddr("paymasterOperator");
    (user, userKey) = makeAddrAndKey("user");
    (guarantor, guarantorKey) = makeAddrAndKey("guarantor");
    entryPoint = new EntryPoint();
    entryPointSimulations = new EntryPointSimulations();
    accountFactory = new SimpleAccountFactory(entryPoint);
    paymaster = IWorld(worldAddress);
    account = accountFactory.createAccount(user, 0);
    counter = new TestCounter();

    vm.prank(NamespaceOwner.get(ROOT_NAMESPACE_ID));
    EntryPointTable.set(address(entryPoint));
  }

  function testDepositTo(uint256 amount) external {
    vm.deal(address(this), amount);
    paymaster.depositTo{ value: amount }(user);
    assertEq(paymaster.getBalance(user), amount);

    vm.prank(user);
    paymaster.registerSpender(address(account));
    assertEq(paymaster.getAllowance(address(account)), amount);

    assertEq(entryPoint.balanceOf(address(paymaster)), amount);
  }

  function testWithdrawTo(uint256 depositAmount, uint256 withdrawAmount) external {
    vm.assume(depositAmount >= withdrawAmount);

    address payable withdrawAddress = payable(makeAddr("withdrawAddress"));
    vm.deal(address(this), depositAmount);
    paymaster.depositTo{ value: depositAmount }(user);
    assertEq(paymaster.getBalance(user), depositAmount);
    assertEq(user.balance, 0);
    assertEq(entryPoint.balanceOf(address(paymaster)), depositAmount);

    vm.prank(user);
    paymaster.registerSpender(address(account));
    assertEq(paymaster.getAllowance(address(account)), depositAmount);

    vm.prank(user);
    paymaster.withdrawTo(withdrawAddress, withdrawAmount);

    assertEq(user.balance, 0);
    assertEq(withdrawAddress.balance, withdrawAmount);
    assertEq(paymaster.getAllowance(address(account)), depositAmount - withdrawAmount);
    assertEq(paymaster.getBalance(address(user)), depositAmount - withdrawAmount);
    assertEq(entryPoint.balanceOf(address(paymaster)), depositAmount - withdrawAmount);
  }

  function testWithdrawFail() external {
    vm.deal(address(this), 1 ether);
    paymaster.depositTo{ value: 1 ether }(user);

    vm.prank(user);
    vm.expectRevert("Insufficient balance");
    paymaster.withdrawTo(payable(user), 1 ether + 1);
  }

  // sanity check for everything works without paymaster
  function testCall() external {
    vm.deal(address(account), 1 ether);
    PackedUserOperation memory op = fillUserOp(
      account,
      userKey,
      address(counter),
      0,
      abi.encodeCall(TestCounter.count, ())
    );
    op.signature = signUserOp(op, userKey);
    PackedUserOperation[] memory ops = new PackedUserOperation[](1);
    ops[0] = op;
    entryPoint.handleOps(ops, beneficiary);

    assertEq(counter.counters(address(account)), 1);
  }

  function testPaymaster() external {
    vm.deal(address(this), 1 ether);
    paymaster.depositTo{ value: 1 ether }(user);

    vm.prank(user);
    paymaster.registerSpender(address(account));

    PackedUserOperation memory op = fillUserOp(
      account,
      userKey,
      address(counter),
      0,
      abi.encodeCall(TestCounter.count, ())
    );
    op.paymasterAndData = abi.encodePacked(address(paymaster), uint128(100000), uint128(100000));
    op.signature = signUserOp(op, userKey);
    submitUserOp(op);

    assertEq(counter.counters(address(account)), 1);
  }

  function testCounterRefund() external {
    uint256 startBalance = 1 ether;
    vm.deal(address(this), startBalance);
    paymaster.depositTo{ value: startBalance }(user);

    assertEq(paymaster.getBalance(user), startBalance);

    vm.prank(user);
    paymaster.registerSpender(address(account));

    PackedUserOperation memory op = fillUserOp(
      account,
      userKey,
      address(counter),
      0,
      abi.encodeCall(TestCounter.count, ())
    );
    op.paymasterAndData = abi.encodePacked(address(paymaster), uint128(100000), uint128(100000));
    op.signature = signUserOp(op, userKey);
    submitUserOp(op);

    assertBalances(startBalance, op);
  }

  function testRefundFuzz(uint256 repeat, string calldata junk) external {
    uint256 startBalance = 1 ether;
    vm.deal(address(this), startBalance);
    paymaster.depositTo{ value: startBalance }(user);

    assertEq(paymaster.getBalance(user), startBalance);

    vm.prank(user);
    paymaster.registerSpender(address(account));

    PackedUserOperation memory op = fillUserOp(
      account,
      userKey,
      address(counter),
      0,
      abi.encodeCall(TestCounter.gasWaster, (repeat, junk))
    );
    op.paymasterAndData = abi.encodePacked(address(paymaster), uint128(100000), uint128(100000));
    op.signature = signUserOp(op, userKey);
    submitUserOp(op);

    assertBalances(startBalance, op);
  }

  function testRegisterSpenderWithSignature() public {
    // Fund the user's gas tank
    uint256 startBalance = 1 ether;
    vm.deal(address(this), startBalance);
    paymaster.depositTo{ value: startBalance }(user);

    // Sign a call to register the account as spender for the user
    bytes memory callData = abi.encodeCall(paymaster.registerSpender, (address(account)));
    bytes32 hash = getSignedMessageHash(user, PAYMASTER_SYSTEM_ID, callData, 0, address(paymaster));
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(userKey, hash);
    bytes memory signature = abi.encodePacked(r, s, v);

    // Prepare userOp for calling the paymaster via `callWithSignature`
    PackedUserOperation memory op = fillUserOp(
      account,
      userKey,
      address(paymaster),
      0,
      abi.encodeCall(
        Unstable_CallWithSignatureSystem.callWithSignature,
        (user, PAYMASTER_SYSTEM_ID, callData, signature)
      )
    );
    op.paymasterAndData = abi.encodePacked(address(paymaster), uint128(100000), uint128(100000));
    op.accountGasLimits = bytes32(abi.encodePacked(bytes16(uint128(80000)), bytes16(uint128(110000))));
    op.signature = signUserOp(op, userKey);

    // Submit the userOp
    submitUserOp(op);

    // Assert that the account is set as a spender and the user paid for it
    assertGt(paymaster.getAllowance(address(account)), 0);
    assertLt(paymaster.getBalance(user), startBalance);

    // Assert the paymaster gas estimation is correct
    assertBalances(startBalance, op);
  }

  function assertBalances(uint256 startBalance, PackedUserOperation memory op) internal {
    uint256 paymasterBalance = entryPoint.balanceOf(address(paymaster));
    uint256 userBalance = paymaster.getBalance(user);

    // Assert that the paymaster balance is always greater than the user balance
    assertGt(paymasterBalance, userBalance, "user balance greater than paymaster balance");

    // Assert that the difference in calculation is less than 500 gas units
    int256 realCost = int256(startBalance - paymasterBalance);
    int256 estimatedCost = int256(startBalance - userBalance);
    int256 diffCost = estimatedCost - realCost;
    console.log("overhead in estimated cost:");
    console.logInt(diffCost);
    uint256 realFeePerGas = getUserOpGasPrice(op);
    int256 diffGas = diffCost / int256(realFeePerGas);
    console.log("overhead in gas units:");
    console.logInt(diffGas);
    assertLt(diffGas, 8000);
  }

  function fillUserOp(
    SimpleAccount _sender,
    uint256 _key,
    address _to,
    uint256 _value,
    bytes memory _data
  ) public view returns (PackedUserOperation memory op) {
    op.sender = address(_sender);
    op.nonce = entryPoint.getNonce(address(_sender), 0);
    op.callData = abi.encodeCall(SimpleAccount.execute, (_to, _value, _data));
    op.accountGasLimits = bytes32(abi.encodePacked(bytes16(uint128(80000)), bytes16(uint128(50000))));
    op.preVerificationGas = 50000;
    op.gasFees = bytes32(abi.encodePacked(bytes16(uint128(100)), bytes16(uint128(1000000000))));
    op.signature = signUserOp(op, _key);
    return op;
  }

  function signUserOp(PackedUserOperation memory op, uint256 _key) public view returns (bytes memory signature) {
    bytes32 hash = entryPoint.getUserOpHash(op);
    (uint8 v, bytes32 r, bytes32 s) = vm.sign(_key, MessageHashUtils.toEthSignedMessageHash(hash));
    signature = abi.encodePacked(r, s, v);
  }

  function submitUserOp(PackedUserOperation memory op) public {
    PackedUserOperation[] memory ops = new PackedUserOperation[](1);
    ops[0] = op;
    entryPoint.handleOps(ops, beneficiary);
  }

  function getUserOpGasPrice(PackedUserOperation memory op) internal view returns (uint256) {
    uint256 maxFeePerGas = UserOperationLib.unpackLow128(op.gasFees);
    uint256 maxPriorityFeePerGas = UserOperationLib.unpackHigh128(op.gasFees);
    if (maxFeePerGas == maxPriorityFeePerGas) {
      // legacy mode (for networks that don't support basefee opcode)
      return maxFeePerGas;
    }
    return min(maxFeePerGas, maxPriorityFeePerGas + block.basefee);
  }
}
