// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;
import { IComponent } from "./IComponent.sol";
import { LinkedList } from "memmove/LinkedList.sol";

enum QueryType {
  Has,
  Not,
  HasValue,
  NotValue,
  ProxyRead,
  ProxyExpand
}

// For ProxyRead and ProxyExpand QueryFragments:
// - component must be a component whose raw value decodes to a single uint256
// - value must decode to a single uint256 represents the proxy depth
struct QueryFragment {
  QueryType queryType;
  IComponent component;
  bytes value;
}
