// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

enum SelectionType {
  Equal,
  NotEqual
}

struct SelectionFragment {
  SelectionType selectionType;
  uint8 fieldIndex;
  bytes value;
}

struct Record {
  bytes32[] key;
  bytes[] value;
}
