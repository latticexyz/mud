// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreView } from "store/StoreView.sol";
import { OwnerTable } from "./tables/OwnerTable.sol";
import { RouteAccessTable } from "./tables/RouteAccessTable.sol";
import { RouteTable } from "./tables/RouteTable.sol";
import { SystemRouteTable } from "./tables/SystemRouteTable.sol";
import { SystemTable } from "./tables/SystemTable.sol";

contract World is StoreView {
  constructor() {
    SystemTable.registerSchemaInternal();
    RouteTable.registerSchemaInternal();
    RouteAccessTable.registerSchemaInternal();
    SystemRouteTable.registerSchemaInternal();
    OwnerTable.registerSchemaInternal();
  }
}
