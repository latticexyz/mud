// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract World {}

// RouteKey: [routeId]
struct RouteSchema {
  string preImage;
}

// RouteAccessKey: [routeId, caller]
struct RouteAccessSchema {
  bool access;
}

// OwnerKey: [owned]
struct OwnerSchema {
  address owner;
}

// SystemKey: [routeId]
struct SystemSchema {
  bool openAccess;
  address system;
}

// SystemToRouteKey: [systemAddress]
struct SystemToRouteSchema {
  bytes32 routeId;
}
