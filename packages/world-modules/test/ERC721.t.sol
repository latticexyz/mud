// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { World } from "@latticexyz/world/src/World.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { CoreModule } from "@latticexyz/world/src/modules/core/CoreModule.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { PuppetModule } from "../src/modules/puppet/PuppetModule.sol";
import { ERC721Module } from "../src/modules/erc721-puppet/ERC721Module.sol";
import { ERC721MetadataData } from "../src/modules/erc721-puppet/tables/ERC721Metadata.sol";
import { IERC721Mintable } from "../src/modules/erc721-puppet/IERC721Mintable.sol";
import { registerERC721 } from "../src/modules/erc721-puppet/registerERC721.sol";
import { IERC721Errors } from "../src/modules/erc721-puppet/IERC721Errors.sol";
import { IERC721Events } from "../src/modules/erc721-puppet/IERC721Events.sol";
import { _erc721SystemId } from "../src/modules/erc721-puppet/utils.sol";

abstract contract ERC721TokenReceiver {
  function onERC721Received(address, address, uint256, bytes calldata) external virtual returns (bytes4) {
    return ERC721TokenReceiver.onERC721Received.selector;
  }
}

contract ERC721Recipient is ERC721TokenReceiver {
  address public operator;
  address public from;
  uint256 public id;
  bytes public data;

  function onERC721Received(
    address _operator,
    address _from,
    uint256 _id,
    bytes calldata _data
  ) public virtual override returns (bytes4) {
    operator = _operator;
    from = _from;
    id = _id;
    data = _data;

    return ERC721TokenReceiver.onERC721Received.selector;
  }
}

contract RevertingERC721Recipient is ERC721TokenReceiver {
  function onERC721Received(address, address, uint256, bytes calldata) public virtual override returns (bytes4) {
    revert(string(abi.encodePacked(ERC721TokenReceiver.onERC721Received.selector)));
  }
}

contract WrongReturnDataERC721Recipient is ERC721TokenReceiver {
  function onERC721Received(address, address, uint256, bytes calldata) public virtual override returns (bytes4) {
    return 0xCAFEBEEF;
  }
}

contract NonERC721Recipient {}

contract ERC721Test is Test, GasReporter, IERC721Events, IERC721Errors {
  using WorldResourceIdInstance for ResourceId;

  IBaseWorld world;
  ERC721Module erc721Module;
  IERC721Mintable token;
  address tokenOwner = address(0x123456);

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());
    world.installModule(new PuppetModule(), new bytes(0));
    StoreSwitch.setStoreAddress(address(world));

    // Register a new ERC721 token
    vm.prank(tokenOwner);
    token = registerERC721(world, "myERC721", ERC721MetadataData({ name: "Token", symbol: "TKN", baseURI: "" }));
  }

  function _expectAccessDenied(address caller) internal {
    ResourceId tokenSystemId = _erc721SystemId("myERC721");
    vm.expectRevert(abi.encodePacked(IWorldErrors.World_AccessDenied.selector, tokenSystemId.toString(), caller));
  }

  function _expectMintEvent(address to, uint256 id) internal {
    _expectTransferEvent(address(0), to, id);
  }

  function _expectBurnEvent(address from, uint256 id) internal {
    _expectTransferEvent(from, address(0), id);
  }

  function _expectTransferEvent(address from, address to, uint256 id) internal {
    vm.expectEmit(true, true, true, true);
    emit Transfer(from, to, id);
  }

  function _expectApprovalEvent(address owner, address approved, uint256 id) internal {
    vm.expectEmit(true, true, true, true);
    emit Approval(owner, approved, id);
  }

  function _expectApprovalForAllEvent(address owner, address operator, bool approved) internal {
    vm.expectEmit(true, true, true, true);
    emit ApprovalForAll(owner, operator, approved);
  }

  function testMint(uint256 id, address owner) public {
    vm.assume(owner != address(0));

    vm.prank(tokenOwner);
    _expectMintEvent(owner, id);
    token.mint(owner, id);

    assertEq(token.balanceOf(owner), 1);
    assertEq(_ownerOf(id), owner);
  }

  function testMintRevertAccessDenied(uint256 id, address owner) public {
    vm.assume(owner != address(0));

    _expectAccessDenied(address(this));
    token.mint(owner, id);
  }

  function testBurn(uint256 id, address owner) public {
    vm.assume(owner != address(0));

    _expectMintEvent(owner, id);
    token.mint(owner, id);

    vm.prank(tokenOwner);
    _expectBurnEvent(owner, id);
    token.burn(id);

    assertEq(token.balanceOf(owner), 0);

    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.ownerOf(id);
  }

  function testBurnRevertAccessDenined() public {
    vm.assume(owner != address(0));

    vm.prank(tokenOwner);
    _expectMintEvent(owner, id);
    token.mint(owner, id);

    _expectAccessDenied(address(this));
    token.burn(id);
  }

  function testTransferFrom(address owner, uint256 tokenId) public {
    vm.assume(owner != address(0));

    vm.prank(tokenOwner);
    token.mint(owner, tokenId);

    vm.prank(owner);
    token.transferFrom(owner, address(this), tokenId);

    assertEq(token.balanceOf(owner), tokenId);
    assertEq(token.balanceOf(address(this)), tokenId);
    assertEq(token.ownerOf(tokenId), address(this));
  }

  function testApprove(uint256 id, address spender) public {
    vm.prank(tokenOwner);
    token.mint(address(this), id);

    _expectApprovalEvent(address(this), spender, id);
    token.approve(spender, id);
    assertEq(token.getApproved(id), spender);
  }

  function testApproveBurn(uint256 id, address spender) public {
    vm.prank(tokenOwner);
    token.mint(address(this), id);

    token.approve(spender, id);

    // Burn by sending to 0 address
    token.transferFrom(address(this), address(0), id);
    assertEq(token.balanceOf(address(this)), 0);

    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.getApproved(id);

    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.ownerOf(id);
  }

  function testApproveAll(address operator, bool approved) public {
    _expectApprovalForAllEvent(address(this), operator, approved);
    token.setApprovalForAll(operator, approved);
    assertEq(token.isApprovedForAll(address(this), operator), approved);
  }

  function testTransferFromSelf(uint256 id, address from, address to) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(from);
    token.transferFrom(from, to, id);

    assertEq(token.getApproved(id), address(0));
    assertEq(token.ownerOf(id), to);
    assertEq(token.balanceOf(to), 1);
    assertEq(token.balanceOf(from), 0);
  }

  function testTransferFromApproveAll(uint256 id, address from, address to, address operator) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(from);
    token.setApprovalForAll(operator, true);

    vm.prank(operator);
    token.transferFrom(from, to, id);

    assertEq(token.getApproved(id), address(0));
    assertEq(token.ownerOf(id), to);
    assertEq(token.balanceOf(to), 1);
    assertEq(token.balanceOf(from), 0);
  }

  function testSafeTransferFromToEOA(uint256 id, address from, address to, address operator) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(from);
    token.setApprovalForAll(operator, true);

    vm.prank(operator);
    token.safeTransferFrom(from, to, id);

    assertEq(token.getApproved(id), address(0));
    assertEq(token.ownerOf(id), to);
    assertEq(token.balanceOf(to), 1);
    assertEq(token.balanceOf(from), 0);
  }

  function testSafeTransferFromToERC721Recipient(uint256 id, address from, address operator) public {
    ERC721Recipient recipient = new ERC721Recipient();

    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(from);
    token.setApprovalForAll(operator, true);

    vm.prank(operator);
    token.safeTransferFrom(from, address(recipient), id);

    assertEq(token.getApproved(id), address(0));
    assertEq(token.ownerOf(id), address(recipient));
    assertEq(token.balanceOf(address(recipient)), 1);
    assertEq(token.balanceOf(from), 0);

    assertEq(recipient.operator(), operator);
    assertEq(recipient.from(), from);
    assertEq(recipient.id(), id);
    assertEq(recipient.data(), "");
  }

  function testSafeTransferFromToERC721RecipientWithData(
    uint256 id,
    address from,
    address operator,
    bytes memory data
  ) public {
    ERC721Recipient recipient = new ERC721Recipient();

    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(from);
    token.setApprovalForAll(operator, true);

    vm.prank(operator);
    token.safeTransferFrom(from, address(recipient), id, data);

    assertEq(recipient.data(), data);
    assertEq(recipient.id(), id);
    assertEq(recipient.operator(), operator);
    assertEq(recipient.from(), from);

    assertEq(token.getApproved(id), address(0));
    assertEq(token.ownerOf(id), address(recipient));
    assertEq(token.balanceOf(address(recipient)), 1);
    assertEq(token.balanceOf(from), 0);
  }

  function testSafeMintToEOA(uint256 id, address to) public {
    vm.prank(tokenOwner);
    token.safeMint(to, id);

    assertEq(token.ownerOf(id), address(to));
    assertEq(token.balanceOf(address(to)), 1);
  }

  function testSafeMintToERC721Recipient(uint256 id) public {
    ERC721Recipient to = new ERC721Recipient();

    vm.prank(tokenOwner);
    token.safeMint(address(to), id);

    assertEq(token.ownerOf(id), address(to));
    assertEq(token.balanceOf(address(to)), 1);

    assertEq(to.operator(), tokenOwner);
    assertEq(to.from(), address(0));
    assertEq(to.id(), id);
    assertEq(to.data(), "");
  }

  function testSafeMintToERC721RecipientWithData(uint256 id, bytes memory data) public {
    ERC721Recipient to = new ERC721Recipient();

    vm.prank(tokenOwner);
    token.safeMint(address(to), id, data);

    assertEq(token.ownerOf(id), address(to));
    assertEq(token.balanceOf(address(to)), 1);

    assertEq(to.operator(), tokenOwner);
    assertEq(to.from(), address(0));
    assertEq(to.id(), id);
    assertEq(to.data(), data);
  }

  function testMintToZeroReverts(uint256 id) public {
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, address(0)));
    vm.prank(tokenOwner);
    token.mint(address(0), id);
  }

  function testDoubleMintReverts(uint256 id, address to) public {
    vm.prank(tokenOwner);
    token.mint(to, id);

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721InvalidSender.selector, address(0)));
    token.mint(to, id);
  }

  function testBurnNonExistentReverts(uint256 id) public {
    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.burn(id);
  }

  function testDoubleBurnReverts(uint256 id, address to) public {
    vm.prank(tokenOwner);
    token.mint(to, id);

    vm.prank(tokenOwner);
    token.burn(id);

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.burn(id);
  }

  function testApproveNonExistentReverts(uint256 id, address to) public {
    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.approve(to, id);
  }

  function testApproveUnauthorizedReverts(uint256 id, address owner, address to) public {
    vm.prank(tokenOwner);
    token.mint(owner, id);

    vm.expectRevert(abi.encodePacked(ERC721InvalidApprover.selector, address(this)));
    token.approve(to, id);
  }

  function testTransferFromNotExistentReverts(address from, address to, uint256 id) public {
    vm.expectRevert(abi.encodePacked(ERC721NonexistentToken.selector, id));
    token.transferFrom(from, to, id);
  }

  function testTransferFromWrongFromReverts(address to, uint256 id, address owner, address from) public {
    vm.prank(tokenOwner);
    token.mint(owner, id);

    vm.expectRevert(abi.encodePacked(ERC721IncorrectOwner.selector, from, id, owner));
    token.transferFrom(from, to, id);
  }

  function testTransferFromToZeroReverts(uint256 id) public {
    vm.prank(tokenOwner);
    token.mint(address(this), id);

    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, address(0)));
    token.transferFrom(address(this), address(0), id);
  }

  function testTransferFromNotOwner(uint256 id, address from, address to, address operator) public {
    vm.assume(operator != from);

    vm.prank(tokenOwner);
    token.mint(from, id);

    vm.prank(operator);
    vm.expectRevert(abi.encodePacked(ERC721InsufficientApproval.selector, operator, id));
    token.transferFrom(from, to, id);
  }

  function testSafeTransferFromToNonERC721RecipientReverts(uint256 id, address from) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new NonERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeTransferFrom(from, to, id);
  }

  function testSafeTransferFromToNonERC721RecipientWithDataReverts(uint256 id, address from, bytes memory data) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new NonERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeTransferFrom(from, to, id, data);
  }

  function testSafeTransferFromToRevertingERC721RecipientReverts(uint256 id, address from) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new RevertingERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeTransferFrom(from, to, id);
  }

  function testSafeTransferFromToRevertingERC721RecipientWithDataReverts(
    uint256 id,
    address from,
    bytes memory data
  ) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new RevertingERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721TokenReceiver.onERC721Received.selector));
    token.safeTransferFrom(from, to, id, data);
  }

  function testSafeTransferFromToERC721RecipientWithWrongReturnDataReverts(uint256 id, address from) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new WrongReturnDataERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeTransferFrom(from, to, id);
  }

  function testSafeTransferFromToERC721RecipientWithWrongReturnDataWithDataReverts(
    uint256 id,
    address from,
    bytes memory data
  ) public {
    vm.prank(tokenOwner);
    token.mint(from, id);

    address to = address(new WrongReturnDataERC721Recipient());

    vm.prank(from);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeTransferFrom(from, to, id, data);
  }

  function testSafeMintToNonERC721RecipientReverts(uint256 id) public {
    address to = address(new NonERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeMint(to, id);
  }

  function testSafeMintToNonERC721RecipientWithDataReverts(uint256 id, bytes memory data) public {
    address to = address(new NonERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeMint(to, id, data);
  }

  function testSafeMintToRevertingERC721RecipientReverts(uint256 id) public {
    address to = address(new RevertingERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721TokenReceiver.onERC721Received.selector));
    token.safeMint(to, id);
  }

  function testSafeMintToRevertingERC721RecipientWithDataReverts(uint256 id, bytes memory data) public {
    address to = address(new RevertingERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721TokenReceiver.onERC721Received.selector));
    token.safeMint(to, id, data);
  }

  function testSafeMintToERC721RecipientWithWrongReturnData(uint256 id) public {
    address to = address(new WrongReturnDataERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeMint(to, id);
  }

  function testSafeMintToERC721RecipientWithWrongReturnDataWithData(uint256 id, bytes memory data) public {
    address to = address(new WrongReturnDataERC721Recipient());

    vm.prank(tokenOwner);
    vm.expectRevert(abi.encodePacked(ERC721InvalidReceiver.selector, to));
    token.safeMint(to, id, data);
  }

  function testOwnerOfNonExistent(uint256 id) public {
    token.ownerOf(id);
  }
}
