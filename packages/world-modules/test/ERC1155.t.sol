// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { createCoreModule } from "@latticexyz/world/test/createCoreModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { PuppetModule } from "../src/modules/puppet/PuppetModule.sol";
import { ERC1155Module } from "../src/modules/erc1155-puppet/ERC1155Module.sol";
import { TokenMetadataData } from "../src/modules/tokens/tables/TokenMetadata.sol";
import { IERC1155Mintable } from "../src/modules/erc1155-puppet/IERC1155Mintable.sol";
import { registerERC1155 } from "../src/modules/erc1155-puppet/registerERC1155.sol";
import { IERC1155Errors } from "../src/modules/erc1155-puppet/IERC1155Errors.sol";
import { IERC1155Events } from "../src/modules/erc1155-puppet/IERC1155Events.sol";
import { IERC1155Receiver } from "../src/modules/erc1155-puppet/IERC1155Receiver.sol";
import { _erc1155SystemId } from "../src/modules/erc1155-puppet/utils.sol";

contract ERC1155Recipient is IERC1155Receiver {
  address public operator;
  address public from;
  uint256 public id;
  uint256 public amount;
  bytes public mintData;

  function onERC1155Received(
    address _operator,
    address _from,
    uint256 _id,
    uint256 _amount,
    bytes calldata _data
  ) public returns (bytes4) {
    operator = _operator;
    from = _from;
    id = _id;
    amount = _amount;
    mintData = _data;

    return IERC1155Receiver.onERC1155Received.selector;
  }

  address public batchOperator;
  address public batchFrom;
  uint256[] internal _batchIds;
  uint256[] internal _batchAmounts;
  bytes public batchData;

  function batchIds() external view returns (uint256[] memory) {
    return _batchIds;
  }

  function batchAmounts() external view returns (uint256[] memory) {
    return _batchAmounts;
  }

  function onERC1155BatchReceived(
    address _operator,
    address _from,
    uint256[] calldata _ids,
    uint256[] calldata _amounts,
    bytes calldata _data
  ) public returns (bytes4) {
    batchOperator = _operator;
    batchFrom = _from;
    _batchIds = _ids;
    _batchAmounts = _amounts;
    batchData = _data;

    return IERC1155Receiver.onERC1155BatchReceived.selector;
  }
}

contract RevertingERC1155Recipient is IERC1155Receiver {
  function onERC1155Received(address, address, uint256, uint256, bytes calldata) public pure returns (bytes4) {
    revert(string(abi.encodePacked(IERC1155Receiver.onERC1155Received.selector)));
  }

  function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
  ) external pure override returns (bytes4) {
    revert(string(abi.encodePacked(IERC1155Receiver.onERC1155BatchReceived.selector)));
  }
}

contract WrongReturnDataERC1155Recipient is IERC1155Receiver {
  function onERC1155Received(address, address, uint256, uint256, bytes calldata) public pure returns (bytes4) {
    return 0xCAFEBEEF;
  }

  function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
  ) external pure returns (bytes4) {
    return 0xCAFEBEEF;
  }
}

contract NonERC1155Recipient {}

contract ERC1155Test is Test, GasReporter, IERC1155Events, IERC1155Errors, IERC1155Receiver {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  ERC1155Module erc1155Module;
  IERC1155Mintable token;

  mapping(address => mapping(uint256 => uint256)) public userMintAmounts;
  mapping(address => mapping(uint256 => uint256)) public userTransferOrBurnAmounts;

  //required for the transfer-from-self (e.g. this test contract) unit tests to work
  function onERC1155Received(address, address, uint256, uint256, bytes calldata) public pure returns (bytes4) {
    return IERC1155Receiver.onERC1155Received.selector;
  }

  function onERC1155BatchReceived(
    address,
    address,
    uint256[] calldata,
    uint256[] calldata,
    bytes calldata
  ) public pure returns (bytes4) {
    return IERC1155Receiver.onERC1155BatchReceived.selector;
  }

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(createCoreModule());
    world.installModule(new PuppetModule(), new bytes(0));
    StoreSwitch.setStoreAddress(address(world));

    // Register a new ERC721 token
    token = registerERC1155(world, "myERC1155", TokenMetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));
  }

  function _expectAccessDenied(address caller) internal {
    ResourceId tokenSystemId = _erc1155SystemId("myERC1155");
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, tokenSystemId.toString(), caller));
  }

  function _expectMintSingleEvent(address operator, address to, uint256 id, uint256 value) internal {
    _expectTransferSingleEvent(operator, address(0), to, id, value);
  }

  function _expectMintBatchEvent(
    address operator,
    address to,
    uint256[] calldata ids,
    uint256[] calldata values
  ) internal {
    _expectTransferBatchEvent(operator, address(0), to, ids, values);
  }

  function _expectBurnSingleEvent(address operator, address from, uint256 id, uint256 value) internal {
    _expectTransferSingleEvent(operator, from, address(0), id, value);
  }

  function _expectBurnBatchEvent(
    address operator,
    address from,
    uint256[] calldata ids,
    uint256[] calldata values
  ) internal {
    _expectTransferBatchEvent(operator, from, address(0), ids, values);
  }

  function _expectTransferSingleEvent(address operator, address from, address to, uint256 id, uint256 value) internal {
    vm.expectEmit(true, true, true, true);
    emit TransferSingle(operator, from, to, id, value);
  }

  function _expectTransferBatchEvent(
    address operator,
    address from,
    address to,
    uint256[] calldata ids,
    uint256[] calldata values
  ) internal {
    vm.expectEmit(true, true, true, true);
    emit TransferBatch(operator, from, to, ids, values);
  }

  function _expectApprovalForAllEvent(address owner, address operator, bool approved) internal {
    vm.expectEmit(true, true, true, true);
    emit ApprovalForAll(owner, operator, approved);
  }

  function _assumeDifferentNonZero(address address1, address address2) internal pure {
    vm.assume(address1 != address(0));
    vm.assume(address2 != address(0));
    vm.assume(address1 != address2);
  }

  function _assumeEOA(address address1) internal view {
    uint256 toCodeSize;
    assembly {
      toCodeSize := extcodesize(address1)
    }
    vm.assume(toCodeSize == 0);
  }

  function _assumeDifferentNonZero(address address1, address address2, address address3) internal pure {
    vm.assume(address1 != address(0));
    vm.assume(address2 != address(0));
    vm.assume(address3 != address(0));
    vm.assume(address1 != address2);
    vm.assume(address2 != address3);
    vm.assume(address3 != address1);
  }

  function testSetUp() public {
    assertTrue(address(token) != address(0));
    assertEq(NamespaceOwner.get(WorldResourceIdLib.encodeNamespace("myERC1155")), address(this));
  }

  function testInstallTwice() public {
    // Install the ERC721 module again
    IERC1155Mintable anotherToken = registerERC1155(
      world,
      "anotherERC1155",
      TokenMetadataData({ name: "Token", symbol: "TKN", baseURI: "" })
    );
    assertTrue(address(anotherToken) != address(0));
    assertTrue(address(anotherToken) != address(token));
  }

  function testMintToEOA() public {
    _assumeEOA(address(0xBEEF));
    token.mint(address(0xBEEF), 1337, 1, "");

    assertEq(token.balanceOf(address(0xBEEF), 1337), 1);
  }

  function testMintToERC1155Recipient() public {
    ERC1155Recipient to = new ERC1155Recipient();

    token.mint(address(to), 1337, 1, "testing 123");

    assertEq(token.balanceOf(address(to), 1337), 1);

    assertEq(to.operator(), address(this));
    assertEq(to.from(), address(0));
    assertEq(to.id(), 1337);
    assertEq(to.mintData(), "testing 123");
  }

  function testmintBatchToEOA() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory amounts = new uint256[](5);
    amounts[0] = 100;
    amounts[1] = 200;
    amounts[2] = 300;
    amounts[3] = 400;
    amounts[4] = 500;

    _assumeEOA(address(0xBEEF));
    token.mintBatch(address(0xBEEF), ids, amounts, "");

    assertEq(token.balanceOf(address(0xBEEF), 1337), 100);
    assertEq(token.balanceOf(address(0xBEEF), 1338), 200);
    assertEq(token.balanceOf(address(0xBEEF), 1339), 300);
    assertEq(token.balanceOf(address(0xBEEF), 1340), 400);
    assertEq(token.balanceOf(address(0xBEEF), 1341), 500);
  }

  function testmintBatchToERC1155Recipient() public {
    ERC1155Recipient to = new ERC1155Recipient();

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory amounts = new uint256[](5);
    amounts[0] = 100;
    amounts[1] = 200;
    amounts[2] = 300;
    amounts[3] = 400;
    amounts[4] = 500;

    token.mintBatch(address(to), ids, amounts, "testing 123");

    assertEq(to.batchOperator(), address(this));
    assertEq(to.batchFrom(), address(0));
    assertEq(to.batchIds(), ids);
    assertEq(to.batchAmounts(), amounts);
    assertEq(to.batchData(), "testing 123");

    assertEq(token.balanceOf(address(to), 1337), 100);
    assertEq(token.balanceOf(address(to), 1338), 200);
    assertEq(token.balanceOf(address(to), 1339), 300);
    assertEq(token.balanceOf(address(to), 1340), 400);
    assertEq(token.balanceOf(address(to), 1341), 500);
  }

  function testBurn() public {
    token.mint(address(0xBEEF), 1337, 100, "");

    token.burn(address(0xBEEF), 1337, 70);

    assertEq(token.balanceOf(address(0xBEEF), 1337), 30);
  }

  function testburnBatch() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory burnAmounts = new uint256[](5);
    burnAmounts[0] = 50;
    burnAmounts[1] = 100;
    burnAmounts[2] = 150;
    burnAmounts[3] = 200;
    burnAmounts[4] = 250;

    token.mintBatch(address(0xBEEF), ids, mintAmounts, "");

    token.burnBatch(address(0xBEEF), ids, burnAmounts);

    assertEq(token.balanceOf(address(0xBEEF), 1337), 50);
    assertEq(token.balanceOf(address(0xBEEF), 1338), 100);
    assertEq(token.balanceOf(address(0xBEEF), 1339), 150);
    assertEq(token.balanceOf(address(0xBEEF), 1340), 200);
    assertEq(token.balanceOf(address(0xBEEF), 1341), 250);
  }

  function testApproveAll(address owner, address operator, bool approved) public {
    _assumeDifferentNonZero(owner, operator);

    vm.prank(owner);
    _expectApprovalForAllEvent(owner, operator, approved);

    startGasReport("setApprovalForAll");
    token.setApprovalForAll(operator, approved);
    endGasReport();

    assertEq(token.isApprovedForAll(owner, operator), approved);
  }

  function testSafeTransferFromToEOA() public {
    address from = address(0xABCD);

    token.mint(from, 1337, 100, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, address(0xBEEF), 1337, 70, "");

    assertEq(token.balanceOf(address(0xBEEF), 1337), 70);
    assertEq(token.balanceOf(from, 1337), 30);
  }

  function testSafeTransferFromToERC1155Recipient() public {
    ERC1155Recipient to = new ERC1155Recipient();

    address from = address(0xABCD);

    token.mint(from, 1337, 100, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, address(to), 1337, 70, "testing 123");

    assertEq(to.operator(), address(this));
    assertEq(to.from(), from);
    assertEq(to.id(), 1337);
    assertEq(to.mintData(), "testing 123");

    assertEq(token.balanceOf(address(to), 1337), 70);
    assertEq(token.balanceOf(from, 1337), 30);
  }

  function testSafeTransferFromSelf() public {
    token.mint(address(this), 1337, 100, "");

    token.safeTransferFrom(address(this), address(0xBEEF), 1337, 70, "");

    assertEq(token.balanceOf(address(0xBEEF), 1337), 70);
    assertEq(token.balanceOf(address(this), 1337), 30);
  }

  function testSafeBatchTransferFromToEOA() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(0xBEEF), ids, transferAmounts, "");

    assertEq(token.balanceOf(from, 1337), 50);
    assertEq(token.balanceOf(address(0xBEEF), 1337), 50);

    assertEq(token.balanceOf(from, 1338), 100);
    assertEq(token.balanceOf(address(0xBEEF), 1338), 100);

    assertEq(token.balanceOf(from, 1339), 150);
    assertEq(token.balanceOf(address(0xBEEF), 1339), 150);

    assertEq(token.balanceOf(from, 1340), 200);
    assertEq(token.balanceOf(address(0xBEEF), 1340), 200);

    assertEq(token.balanceOf(from, 1341), 250);
    assertEq(token.balanceOf(address(0xBEEF), 1341), 250);
  }

  function testSafeBatchTransferFromToERC1155Recipient() public {
    address from = address(0xABCD);

    ERC1155Recipient to = new ERC1155Recipient();
    _assumeDifferentNonZero(from, address(to));

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(to), ids, transferAmounts, "testing 123");

    assertEq(to.batchOperator(), address(this));
    assertEq(to.batchFrom(), from);
    assertEq(to.batchIds(), ids);
    assertEq(to.batchAmounts(), transferAmounts);
    assertEq(to.batchData(), "testing 123");

    assertEq(token.balanceOf(from, 1337), 50);
    assertEq(token.balanceOf(address(to), 1337), 50);

    assertEq(token.balanceOf(from, 1338), 100);
    assertEq(token.balanceOf(address(to), 1338), 100);

    assertEq(token.balanceOf(from, 1339), 150);
    assertEq(token.balanceOf(address(to), 1339), 150);

    assertEq(token.balanceOf(from, 1340), 200);
    assertEq(token.balanceOf(address(to), 1340), 200);

    assertEq(token.balanceOf(from, 1341), 250);
    assertEq(token.balanceOf(address(to), 1341), 250);
  }

  function testBatchBalanceOf() public {
    address[] memory tos = new address[](5);
    tos[0] = address(0xBEEF);
    tos[1] = address(0xCAFE);
    tos[2] = address(0xFACE);
    tos[3] = address(0xDEAD);
    tos[4] = address(0xFEED);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    token.mint(address(0xBEEF), 1337, 100, "");
    token.mint(address(0xCAFE), 1338, 200, "");
    token.mint(address(0xFACE), 1339, 300, "");
    token.mint(address(0xDEAD), 1340, 400, "");
    token.mint(address(0xFEED), 1341, 500, "");

    uint256[] memory balances = token.balanceOfBatch(tos, ids);

    assertEq(balances[0], 100);
    assertEq(balances[1], 200);
    assertEq(balances[2], 300);
    assertEq(balances[3], 400);
    assertEq(balances[4], 500);
  }

  function testFailMintToZero() public {
    token.mint(address(0), 1337, 1, "");
  }

  function testFailMintToNonERC155Recipient() public {
    token.mint(address(new NonERC1155Recipient()), 1337, 1, "");
  }

  function testFailMintToRevertingERC155Recipient() public {
    token.mint(address(new RevertingERC1155Recipient()), 1337, 1, "");
  }

  function testFailMintToWrongReturnDataERC155Recipient() public {
    token.mint(address(new RevertingERC1155Recipient()), 1337, 1, "");
  }

  function testFailBurnInsufficientBalance() public {
    token.mint(address(0xBEEF), 1337, 70, "");
    token.burn(address(0xBEEF), 1337, 100);
  }

  function testFailSafeTransferFromInsufficientBalance() public {
    address from = address(0xABCD);

    token.mint(from, 1337, 70, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, address(0xBEEF), 1337, 100, "");
  }

  function testFailSafeTransferFromSelfInsufficientBalance() public {
    token.mint(address(this), 1337, 70, "");
    token.safeTransferFrom(address(this), address(0xBEEF), 1337, 100, "");
  }

  function testFailSafeTransferFromToZero() public {
    token.mint(address(this), 1337, 100, "");
    token.safeTransferFrom(address(this), address(0), 1337, 70, "");
  }

  function testFailSafeTransferFromToNonERC155Recipient() public {
    token.mint(address(this), 1337, 100, "");
    token.safeTransferFrom(address(this), address(new NonERC1155Recipient()), 1337, 70, "");
  }

  function testFailSafeTransferFromToRevertingERC1155Recipient() public {
    token.mint(address(this), 1337, 100, "");
    token.safeTransferFrom(address(this), address(new RevertingERC1155Recipient()), 1337, 70, "");
  }

  function testFailSafeTransferFromToWrongReturnDataERC1155Recipient() public {
    token.mint(address(this), 1337, 100, "");
    token.safeTransferFrom(address(this), address(new WrongReturnDataERC1155Recipient()), 1337, 70, "");
  }

  function testFailSafeBatchTransferInsufficientBalance() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);

    mintAmounts[0] = 50;
    mintAmounts[1] = 100;
    mintAmounts[2] = 150;
    mintAmounts[3] = 200;
    mintAmounts[4] = 250;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 100;
    transferAmounts[1] = 200;
    transferAmounts[2] = 300;
    transferAmounts[3] = 400;
    transferAmounts[4] = 500;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(0xBEEF), ids, transferAmounts, "");
  }

  function testFailSafeBatchTransferFromToZero() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(0), ids, transferAmounts, "");
  }

  function testFailSafeBatchTransferFromToNonERC1155Recipient() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(new NonERC1155Recipient()), ids, transferAmounts, "");
  }

  function testFailSafeBatchTransferFromToRevertingERC1155Recipient() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(new RevertingERC1155Recipient()), ids, transferAmounts, "");
  }

  function testFailSafeBatchTransferFromToWrongReturnDataERC1155Recipient() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](5);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;
    transferAmounts[4] = 250;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(new WrongReturnDataERC1155Recipient()), ids, transferAmounts, "");
  }

  function testFailSafeBatchTransferFromWithArrayLengthMismatch() public {
    address from = address(0xABCD);

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory transferAmounts = new uint256[](4);
    transferAmounts[0] = 50;
    transferAmounts[1] = 100;
    transferAmounts[2] = 150;
    transferAmounts[3] = 200;

    token.mintBatch(from, ids, mintAmounts, "");

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(0xBEEF), ids, transferAmounts, "");
  }

  function testFailmintBatchToZero() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    token.mintBatch(address(0), ids, mintAmounts, "");
  }

  function testFailmintBatchToNonERC1155Recipient() public {
    NonERC1155Recipient to = new NonERC1155Recipient();

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    token.mintBatch(address(to), ids, mintAmounts, "");
  }

  function testFailmintBatchToRevertingERC1155Recipient() public {
    RevertingERC1155Recipient to = new RevertingERC1155Recipient();

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    token.mintBatch(address(to), ids, mintAmounts, "");
  }

  function testFailmintBatchToWrongReturnDataERC1155Recipient() public {
    WrongReturnDataERC1155Recipient to = new WrongReturnDataERC1155Recipient();

    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    token.mintBatch(address(to), ids, mintAmounts, "");
  }

  function testFailmintBatchWithArrayMismatch() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory amounts = new uint256[](4);
    amounts[0] = 100;
    amounts[1] = 200;
    amounts[2] = 300;
    amounts[3] = 400;

    token.mintBatch(address(0xBEEF), ids, amounts, "");
  }

  function testFailburnBatchInsufficientBalance() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 50;
    mintAmounts[1] = 100;
    mintAmounts[2] = 150;
    mintAmounts[3] = 200;
    mintAmounts[4] = 250;

    uint256[] memory burnAmounts = new uint256[](5);
    burnAmounts[0] = 100;
    burnAmounts[1] = 200;
    burnAmounts[2] = 300;
    burnAmounts[3] = 400;
    burnAmounts[4] = 500;

    token.mintBatch(address(0xBEEF), ids, mintAmounts, "");

    token.burnBatch(address(0xBEEF), ids, burnAmounts);
  }

  function testFailburnBatchWithArrayLengthMismatch() public {
    uint256[] memory ids = new uint256[](5);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;
    ids[4] = 1341;

    uint256[] memory mintAmounts = new uint256[](5);
    mintAmounts[0] = 100;
    mintAmounts[1] = 200;
    mintAmounts[2] = 300;
    mintAmounts[3] = 400;
    mintAmounts[4] = 500;

    uint256[] memory burnAmounts = new uint256[](4);
    burnAmounts[0] = 50;
    burnAmounts[1] = 100;
    burnAmounts[2] = 150;
    burnAmounts[3] = 200;

    token.mintBatch(address(0xBEEF), ids, mintAmounts, "");

    token.burnBatch(address(0xBEEF), ids, burnAmounts);
  }

  function testFailBalanceOfBatchWithArrayMismatch() public view {
    address[] memory tos = new address[](5);
    tos[0] = address(0xBEEF);
    tos[1] = address(0xCAFE);
    tos[2] = address(0xFACE);
    tos[3] = address(0xDEAD);
    tos[4] = address(0xFEED);

    uint256[] memory ids = new uint256[](4);
    ids[0] = 1337;
    ids[1] = 1338;
    ids[2] = 1339;
    ids[3] = 1340;

    token.balanceOfBatch(tos, ids);
  }

  function testMintToEOA(address to, uint256 id, uint256 amount, bytes memory mintData) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    token.mint(to, id, amount, mintData);

    assertEq(token.balanceOf(to, id), amount);
  }

  function testMintToERC1155Recipient(uint256 id, uint256 amount, bytes memory mintData) public {
    ERC1155Recipient to = new ERC1155Recipient();

    token.mint(address(to), id, amount, mintData);

    assertEq(token.balanceOf(address(to), id), amount);

    assertEq(to.operator(), address(this));
    assertEq(to.from(), address(0));
    assertEq(to.id(), id);
    assertEq(to.mintData(), mintData);
  }

  function testmintBatchToEOA(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    uint256 minLength = _min2(ids.length, amounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[to][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[to][id] += mintAmount;
    }

    token.mintBatch(to, normalizedIds, normalizedAmounts, mintData);

    for (uint256 i = 0; i < normalizedIds.length; i++) {
      uint256 id = normalizedIds[i];

      assertEq(token.balanceOf(to, id), userMintAmounts[to][id]);
    }
  }

  function testmintBatchToERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    ERC1155Recipient to = new ERC1155Recipient();

    uint256 minLength = _min2(ids.length, amounts.length);
    vm.assume(minLength != 1); // if that's not the case it will fall back to a non-batch event

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(to)][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[address(to)][id] += mintAmount;
    }

    token.mintBatch(address(to), normalizedIds, normalizedAmounts, mintData);

    assertEq(to.batchOperator(), address(this));
    assertEq(to.batchFrom(), address(0));
    assertEq(to.batchIds(), normalizedIds);
    assertEq(to.batchAmounts(), normalizedAmounts);
    assertEq(to.batchData(), mintData);

    for (uint256 i = 0; i < normalizedIds.length; i++) {
      uint256 id = normalizedIds[i];

      assertEq(token.balanceOf(address(to), id), userMintAmounts[address(to)][id]);
    }
  }

  function testBurn(address to, uint256 id, uint256 mintAmount, bytes memory mintData, uint256 burnAmount) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    burnAmount = bound(burnAmount, 0, mintAmount);

    token.mint(to, id, mintAmount, mintData);

    token.burn(to, id, burnAmount);

    assertEq(token.balanceOf(address(to), id), mintAmount - burnAmount);
  }

  function testburnBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory burnAmounts,
    bytes memory mintData
  ) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    uint256 minLength = _min3(ids.length, mintAmounts.length, burnAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedBurnAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(to)][id];

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = bound(mintAmounts[i], 0, remainingMintAmountForId);
      normalizedBurnAmounts[i] = bound(burnAmounts[i], 0, normalizedMintAmounts[i]);

      userMintAmounts[address(to)][id] += normalizedMintAmounts[i];
      userTransferOrBurnAmounts[address(to)][id] += normalizedBurnAmounts[i];
    }

    token.mintBatch(to, normalizedIds, normalizedMintAmounts, mintData);

    token.burnBatch(to, normalizedIds, normalizedBurnAmounts);

    for (uint256 i = 0; i < normalizedIds.length; i++) {
      uint256 id = normalizedIds[i];

      assertEq(token.balanceOf(to, id), userMintAmounts[to][id] - userTransferOrBurnAmounts[to][id]);
    }
  }

  function testApproveAll(address to, bool approved) public {
    vm.assume(to != address(0));
    token.setApprovalForAll(to, approved);

    assertEq(token.isApprovedForAll(address(this), to), approved);
  }

  function testSafeTransferFromToEOA(
    uint256 id,
    uint256 mintAmount,
    bytes memory mintData,
    uint256 transferAmount,
    address to,
    bytes memory transferData
  ) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    transferAmount = bound(transferAmount, 0, mintAmount);

    address from = address(0xABCD);

    token.mint(from, id, mintAmount, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, to, id, transferAmount, transferData);

    if (to == from) {
      assertEq(token.balanceOf(to, id), mintAmount);
    } else {
      assertEq(token.balanceOf(to, id), transferAmount);
      assertEq(token.balanceOf(from, id), mintAmount - transferAmount);
    }
  }

  function testSafeTransferFromToERC1155Recipient(
    uint256 id,
    uint256 mintAmount,
    bytes memory mintData,
    uint256 transferAmount,
    bytes memory transferData
  ) public {
    ERC1155Recipient to = new ERC1155Recipient();

    address from = address(0xABCD);

    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(from, id, mintAmount, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, address(to), id, transferAmount, transferData);

    assertEq(to.operator(), address(this));
    assertEq(to.from(), from);
    assertEq(to.id(), id);
    assertEq(to.mintData(), transferData);

    assertEq(token.balanceOf(address(to), id), transferAmount);
    assertEq(token.balanceOf(from, id), mintAmount - transferAmount);
  }

  function testSafeTransferFromSelf(
    uint256 id,
    uint256 mintAmount,
    bytes memory mintData,
    uint256 transferAmount,
    address to,
    bytes memory transferData
  ) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(address(this), id, mintAmount, mintData);

    token.safeTransferFrom(address(this), to, id, transferAmount, transferData);

    assertEq(token.balanceOf(to, id), transferAmount);
    assertEq(token.balanceOf(address(this), id), mintAmount - transferAmount);
  }

  function testSafeBatchTransferFromToEOA(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    if (to == address(0)) to = address(0xBEEF);

    if (uint256(uint160(to)) <= 18 || to.code.length > 0) return;

    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
      userTransferOrBurnAmounts[from][id] += transferAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, to, normalizedIds, normalizedTransferAmounts, transferData);

    for (uint256 i = 0; i < normalizedIds.length; i++) {
      uint256 id = normalizedIds[i];

      assertEq(token.balanceOf(address(to), id), userTransferOrBurnAmounts[from][id]);
      assertEq(token.balanceOf(from, id), userMintAmounts[from][id] - userTransferOrBurnAmounts[from][id]);
    }
  }

  function testSafeBatchTransferFromToERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    ERC1155Recipient to = new ERC1155Recipient();

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);
    vm.assume(minLength != 1);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
      userTransferOrBurnAmounts[from][id] += transferAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(to), normalizedIds, normalizedTransferAmounts, transferData);

    assertEq(to.batchOperator(), address(this));
    assertEq(to.batchFrom(), from);
    assertEq(to.batchIds(), normalizedIds);
    assertEq(to.batchAmounts(), normalizedTransferAmounts);
    assertEq(to.batchData(), transferData);

    for (uint256 i = 0; i < normalizedIds.length; i++) {
      uint256 id = normalizedIds[i];
      uint256 transferAmount = userTransferOrBurnAmounts[from][id];

      assertEq(token.balanceOf(address(to), id), transferAmount);
      assertEq(token.balanceOf(from, id), userMintAmounts[from][id] - transferAmount);
    }
  }

  function testBatchBalanceOf(
    address[] memory tos,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    uint256 minLength = _min3(tos.length, ids.length, amounts.length);

    address[] memory normalizedTos = new address[](minLength);
    uint256[] memory normalizedIds = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];
      address to = tos[i] == address(0) || tos[i].code.length > 0 ? address(0xBEEF) : tos[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[to][id];

      normalizedTos[i] = to;
      normalizedIds[i] = id;

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      token.mint(to, id, mintAmount, mintData);

      userMintAmounts[to][id] += mintAmount;
    }

    uint256[] memory balances = token.balanceOfBatch(normalizedTos, normalizedIds);

    for (uint256 i = 0; i < normalizedTos.length; i++) {
      assertEq(balances[i], token.balanceOf(normalizedTos[i], normalizedIds[i]));
    }
  }

  function testFailMintToZero(uint256 id, uint256 amount, bytes memory data) public {
    token.mint(address(0), id, amount, data);
  }

  function testFailMintToNonERC155Recipient(uint256 id, uint256 mintAmount, bytes memory mintData) public {
    token.mint(address(new NonERC1155Recipient()), id, mintAmount, mintData);
  }

  function testFailMintToRevertingERC155Recipient(uint256 id, uint256 mintAmount, bytes memory mintData) public {
    token.mint(address(new RevertingERC1155Recipient()), id, mintAmount, mintData);
  }

  function testFailMintToWrongReturnDataERC155Recipient(uint256 id, uint256 mintAmount, bytes memory mintData) public {
    token.mint(address(new RevertingERC1155Recipient()), id, mintAmount, mintData);
  }

  function testFailBurnInsufficientBalance(
    address to,
    uint256 id,
    uint256 mintAmount,
    uint256 burnAmount,
    bytes memory mintData
  ) public {
    burnAmount = bound(burnAmount, mintAmount + 1, type(uint256).max);

    token.mint(to, id, mintAmount, mintData);
    token.burn(to, id, burnAmount);
  }

  function testFailSafeTransferFromInsufficientBalance(
    address to,
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    transferAmount = bound(transferAmount, mintAmount + 1, type(uint256).max);

    token.mint(from, id, mintAmount, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeTransferFrom(from, to, id, transferAmount, transferData);
  }

  function testFailSafeTransferFromSelfInsufficientBalance(
    address to,
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    transferAmount = bound(transferAmount, mintAmount + 1, type(uint256).max);

    token.mint(address(this), id, mintAmount, mintData);
    token.safeTransferFrom(address(this), to, id, transferAmount, transferData);
  }

  function testFailSafeTransferFromToZero(
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(address(this), id, mintAmount, mintData);
    token.safeTransferFrom(address(this), address(0), id, transferAmount, transferData);
  }

  function testFailSafeTransferFromToNonERC155Recipient(
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(address(this), id, mintAmount, mintData);
    token.safeTransferFrom(address(this), address(new NonERC1155Recipient()), id, transferAmount, transferData);
  }

  function testFailSafeTransferFromToRevertingERC1155Recipient(
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(address(this), id, mintAmount, mintData);
    token.safeTransferFrom(address(this), address(new RevertingERC1155Recipient()), id, transferAmount, transferData);
  }

  function testFailSafeTransferFromToWrongReturnDataERC1155Recipient(
    uint256 id,
    uint256 mintAmount,
    uint256 transferAmount,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    transferAmount = bound(transferAmount, 0, mintAmount);

    token.mint(address(this), id, mintAmount, mintData);
    token.safeTransferFrom(
      address(this),
      address(new WrongReturnDataERC1155Recipient()),
      id,
      transferAmount,
      transferData
    );
  }

  function testFailSafeBatchTransferInsufficientBalance(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    if (minLength == 0) revert();

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], mintAmount + 1, type(uint256).max);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, to, normalizedIds, normalizedTransferAmounts, transferData);
  }

  function testFailSafeBatchTransferFromToZero(
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, address(0), normalizedIds, normalizedTransferAmounts, transferData);
  }

  function testFailSafeBatchTransferFromToNonERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(
      from,
      address(new NonERC1155Recipient()),
      normalizedIds,
      normalizedTransferAmounts,
      transferData
    );
  }

  function testFailSafeBatchTransferFromToRevertingERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(
      from,
      address(new RevertingERC1155Recipient()),
      normalizedIds,
      normalizedTransferAmounts,
      transferData
    );
  }

  function testFailSafeBatchTransferFromToWrongReturnDataERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    uint256 minLength = _min3(ids.length, mintAmounts.length, transferAmounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedTransferAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[from][id];

      uint256 mintAmount = bound(mintAmounts[i], 0, remainingMintAmountForId);
      uint256 transferAmount = bound(transferAmounts[i], 0, mintAmount);

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = mintAmount;
      normalizedTransferAmounts[i] = transferAmount;

      userMintAmounts[from][id] += mintAmount;
    }

    token.mintBatch(from, normalizedIds, normalizedMintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(
      from,
      address(new WrongReturnDataERC1155Recipient()),
      normalizedIds,
      normalizedTransferAmounts,
      transferData
    );
  }

  function testFailSafeBatchTransferFromWithArrayLengthMismatch(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory transferAmounts,
    bytes memory mintData,
    bytes memory transferData
  ) public {
    address from = address(0xABCD);

    if (ids.length == transferAmounts.length) revert();

    token.mintBatch(from, ids, mintAmounts, mintData);

    vm.prank(from);
    token.setApprovalForAll(address(this), true);

    token.safeBatchTransferFrom(from, to, ids, transferAmounts, transferData);
  }

  function testFailmintBatchToZero(uint256[] memory ids, uint256[] memory amounts, bytes memory mintData) public {
    uint256 minLength = _min2(ids.length, amounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(0)][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[address(0)][id] += mintAmount;
    }

    token.mintBatch(address(0), normalizedIds, normalizedAmounts, mintData);
  }

  function testFailmintBatchToNonERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    NonERC1155Recipient to = new NonERC1155Recipient();

    uint256 minLength = _min2(ids.length, amounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(to)][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[address(to)][id] += mintAmount;
    }

    token.mintBatch(address(to), normalizedIds, normalizedAmounts, mintData);
  }

  function testFailmintBatchToRevertingERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    RevertingERC1155Recipient to = new RevertingERC1155Recipient();

    uint256 minLength = _min2(ids.length, amounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(to)][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[address(to)][id] += mintAmount;
    }

    token.mintBatch(address(to), normalizedIds, normalizedAmounts, mintData);
  }

  function testFailmintBatchToWrongReturnDataERC1155Recipient(
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    WrongReturnDataERC1155Recipient to = new WrongReturnDataERC1155Recipient();

    uint256 minLength = _min2(ids.length, amounts.length);

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[address(to)][id];

      uint256 mintAmount = bound(amounts[i], 0, remainingMintAmountForId);

      normalizedIds[i] = id;
      normalizedAmounts[i] = mintAmount;

      userMintAmounts[address(to)][id] += mintAmount;
    }

    token.mintBatch(address(to), normalizedIds, normalizedAmounts, mintData);
  }

  function testFailmintBatchWithArrayMismatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory mintData
  ) public {
    if (ids.length == amounts.length) revert();

    token.mintBatch(address(to), ids, amounts, mintData);
  }

  function testFailburnBatchInsufficientBalance(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory burnAmounts,
    bytes memory mintData
  ) public {
    uint256 minLength = _min3(ids.length, mintAmounts.length, burnAmounts.length);

    if (minLength == 0) revert();

    uint256[] memory normalizedIds = new uint256[](minLength);
    uint256[] memory normalizedMintAmounts = new uint256[](minLength);
    uint256[] memory normalizedBurnAmounts = new uint256[](minLength);

    for (uint256 i = 0; i < minLength; i++) {
      uint256 id = ids[i];

      uint256 remainingMintAmountForId = type(uint256).max - userMintAmounts[to][id];

      normalizedIds[i] = id;
      normalizedMintAmounts[i] = bound(mintAmounts[i], 0, remainingMintAmountForId);
      normalizedBurnAmounts[i] = bound(burnAmounts[i], normalizedMintAmounts[i] + 1, type(uint256).max);

      userMintAmounts[to][id] += normalizedMintAmounts[i];
    }

    token.mintBatch(to, normalizedIds, normalizedMintAmounts, mintData);

    token.burnBatch(to, normalizedIds, normalizedBurnAmounts);
  }

  function testFailburnBatchWithArrayLengthMismatch(
    address to,
    uint256[] memory ids,
    uint256[] memory mintAmounts,
    uint256[] memory burnAmounts,
    bytes memory mintData
  ) public {
    if (ids.length == burnAmounts.length) revert();

    token.mintBatch(to, ids, mintAmounts, mintData);

    token.burnBatch(to, ids, burnAmounts);
  }

  function testFailBalanceOfBatchWithArrayMismatch(address[] memory tos, uint256[] memory ids) public view {
    if (tos.length == ids.length) revert();

    token.balanceOfBatch(tos, ids);
  }

  function _min2(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a > b) return b;
    else return a;
  }

  function _min3(uint256 a, uint256 b, uint256 c) internal pure returns (uint256) {
    return _min2(_min2(a, b), c);
  }
}
