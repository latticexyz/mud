// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract BulletinBoard {
  uint256 public nextIndex = 0;

  struct Message {
    string message;
    address postedBy;
    uint256 postedAt;
  }

  mapping(uint256 => Message) messages;

  function post(string memory message) public {
    Message memory toPost;

    toPost.message = message;
    toPost.postedBy = msg.sender;
    toPost.postedAt = block.timestamp;

    messages[nextIndex] = toPost;

    nextIndex = nextIndex + 1;
  }

  function getPost(uint _index) public view returns (string memory, address, uint256) {
    return (messages[_index].message, messages[_index].postedBy, messages[_index].postedAt);
  }
}
