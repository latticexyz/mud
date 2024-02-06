// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { BulletinBoard } from "../src/BulletinBoard.sol";

contract BulletinBoardTest is Test {
  BulletinBoard public board;

  function setUp() public {
    board = new BulletinBoard();
  }

  function testOnePost() public {
    board.post("Hello");
    assertEq(board.nextIndex(), 1, "wrong number of posts");
    string memory message;
    address postedBy;
    uint256 postedAt;
    (message, postedBy, postedAt) = board.getPost(0);
    assertEq(message, "Hello", "wrong message");
    assertEq(postedBy, address(this), "wrong poster");
    assertEq(postedAt, block.timestamp);
  }

  function testTwoPosts() public {
    vm.prank(address(0));
    board.post("Hello");
    board.post("Goodbye");
    assertEq(board.nextIndex(), 2, "wrong number of posts");
    string memory message;
    address postedBy;
    uint256 postedAt;
    (message, postedBy, postedAt) = board.getPost(0);
    assertEq(message, "Hello", "wrong message");
    assertEq(postedBy, address(0), "wrong poster");
    assertEq(postedAt, block.timestamp);
    (message, postedBy, postedAt) = board.getPost(1);
    assertEq(message, "Goodbye", "wrong message");
    assertEq(postedBy, address(this), "wrong poster");
    assertEq(postedAt, block.timestamp);
  }
}
