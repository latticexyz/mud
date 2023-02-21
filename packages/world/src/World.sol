// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Store, IStoreHook } from "@latticexyz/store/Store.sol";
import { StoreCore } from "@latticexyz/store/StoreCore.sol";
import { Schema } from "@latticexyz/store/Schema.sol";

import { OwnerTable } from "./tables/OwnerTable.sol";
import { RouteAccessTable } from "./tables/RouteAccessTable.sol";
import { RouteTable } from "./tables/RouteTable.sol";
import { SystemRouteTable } from "./tables/SystemRouteTable.sol";
import { SystemTable } from "./tables/SystemTable.sol";
import { System } from "./System.sol";
import { ISystemHook } from "./ISystemHook.sol";

bytes32 constant ROOT_ROUTE_ID = keccak256(bytes(""));
bytes32 constant SINGLE_SLASH = "/";

contract World is Store {
  error RouteInvalid(string route);
  error RouteExists(string route);
  error RouteAccessDenied(string route, address caller);
  error SystemExists(address system);

  constructor() {
    SystemTable.registerSchema();
    RouteTable.registerSchema();
    RouteAccessTable.registerSchema();
    SystemRouteTable.registerSchema();
    OwnerTable.registerSchema();

    // Register root route and give ownership to msg.sender
    RouteTable.set({ routeId: ROOT_ROUTE_ID, route: "" }); // Storing this explicitly to trigger the event for indexers
    OwnerTable.set({ key: ROOT_ROUTE_ID, owner: msg.sender });
    RouteAccessTable.set({ routeId: ROOT_ROUTE_ID, caller: msg.sender, access: true });
  }

  /************************************************************************
   *
   *    REGISTRATION METHODS
   *
   ************************************************************************/

  /**
   * Register a new route by extending an existing route
   */
  function registerRoute(string calldata baseRoute, string calldata subRoute) public returns (bytes32 routeId) {
    // Require subroute to be a valid route fragment (start with `/` and don't contain any further `/`)
    if (!_isSingleLevelRoute(subRoute)) revert RouteInvalid(subRoute);

    // Require base route to exist (with a special check for the root route because it's empty and fails the `has` check)
    if (!(keccak256(bytes(baseRoute)) == ROOT_ROUTE_ID || RouteTable.has(keccak256(bytes(baseRoute)))))
      revert RouteInvalid(baseRoute);

    // Construct the new route
    string memory route = string(abi.encodePacked(baseRoute, subRoute));
    routeId = keccak256(bytes(route));

    // Require route to not exist yet
    if (RouteTable.has(routeId)) revert RouteExists(route);

    // Store the route
    RouteTable.set({ routeId: routeId, route: route });

    // Add caller as owner of the new route
    OwnerTable.set({ key: routeId, owner: msg.sender });

    // Give caller access to the route
    RouteAccessTable.set({ routeId: routeId, caller: msg.sender, access: true });
  }

  /**
   * Register register a table with given schema at the given route
   */
  function registerTable(
    string calldata baseRoute,
    string calldata tableRoute,
    Schema schema
  ) public returns (uint256 tableRouteId) {
    // Register table route
    tableRouteId = uint256(registerRoute(baseRoute, tableRoute));

    // StoreCore handles checking for existence
    StoreCore.registerSchema(tableRouteId, schema);
  }

  /**
   * Register a schema for a given table id
   * This overload exists to conform to the Store interface,
   * but it requires the caller to register a route using `registerRoute` first
   */
  function registerSchema(uint256 tableId, Schema schema) public override {
    // Require caller to own the given tableId
    if (OwnerTable.get(bytes32(tableId)) != msg.sender)
      revert RouteAccessDenied(RouteTable.get(bytes32(tableId)), msg.sender);

    // Register the schema
    StoreCore.registerSchema(tableId, schema);
  }

  /**
   * Register a hook for a given table route
   */
  function registerTableHook(string calldata tableRoute, IStoreHook hook) public {
    registerStoreHook(uint256(keccak256(bytes(tableRoute))), hook);
  }

  /**
   * Register a hook for a given table route id
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public override {
    // Require caller to own the given tableId
    if (OwnerTable.get(bytes32(tableId)) != msg.sender)
      revert RouteAccessDenied(RouteTable.get(bytes32(tableId)), msg.sender);

    // Register the hook
    StoreCore.registerStoreHook(tableId, hook);
  }

  /**
   * Register a hook for a given system route
   */
  function registerSystemHook(string calldata systemRoute, ISystemHook hook) public {
    // TODO
  }

  /**
   * Register a system at the given route
   */
  function registerSystem(
    string calldata baseRoute,
    string calldata systemRoute,
    System system,
    bool publicAccess
  ) public returns (bytes32 systemRouteId) {
    // Require the system to not exist yet
    if (SystemRouteTable.has(address(system))) revert SystemExists(address(system));

    // Require the caller to own the base route
    bytes32 baseRouteId = keccak256(bytes(baseRoute));
    if (OwnerTable.get(baseRouteId) != msg.sender) revert RouteAccessDenied(baseRoute, msg.sender);

    // Register system route
    systemRouteId = registerRoute(baseRoute, systemRoute);

    // Store the system address in the system table
    SystemTable.set({ routeId: systemRouteId, system: address(system), publicAccess: publicAccess });

    // Store the system's route in the SystemToRoute table
    SystemRouteTable.set({ system: address(system), routeId: systemRouteId });

    // Give the system access to its base route
    RouteAccessTable.set({ routeId: baseRouteId, caller: address(system), access: true });
  }

  /**
   * Grant access to a given route
   */
  function grantAccess(string calldata route, address grantee) public {
    // Require the caller to own the route
    bytes32 routeId = keccak256(bytes(route));
    if (OwnerTable.get(routeId) != msg.sender) revert RouteAccessDenied(route, msg.sender);

    // Grant access to the given route
    RouteAccessTable.set({ routeId: routeId, caller: grantee, access: true });
  }

  /**
   * Retract access to a given route
   */
  function retractAccess(string calldata route, address grantee) public {
    // Require the caller to own the route
    bytes32 routeId = keccak256(bytes(route));
    if (OwnerTable.get(routeId) != msg.sender) revert RouteAccessDenied(route, msg.sender);

    // Retract access to the given route
    RouteAccessTable.deleteRecord({ routeId: routeId, caller: grantee });
  }

  /************************************************************************
   *
   *    STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function setRecord(
    string calldata accessRoute,
    string calldata subRoute,
    bytes32[] calldata key,
    bytes calldata data
  ) public {
    // Require access to accessRoute
    if (!_hasAccess(accessRoute, msg.sender)) revert RouteAccessDenied(accessRoute, msg.sender);

    // Require a valid subRoute
    if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);

    // Construct the table route id by concatenating accessRoute and tableRoute
    uint256 tableRouteId = uint256(keccak256(abi.encodePacked(accessRoute, subRoute)));

    // Set the record
    StoreCore.setRecord(tableRouteId, key, data);
  }

  /**
   * Write a record in a table based on access right to the table route id.
   * This overload exists to conform with the `IStore` interface.
   */
  function setRecord(
    uint256 tableRouteId,
    bytes32[] calldata key,
    bytes calldata data
  ) public {
    // Check access based on the tableRoute
    if (!_hasAccess(bytes32(tableRouteId), msg.sender))
      revert RouteAccessDenied(RouteTable.get(bytes32(tableRouteId)), msg.sender);

    // Set the record
    StoreCore.setRecord(tableRouteId, key, data);
  }

  /**
   * Write a field in a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function setField(
    string calldata accessRoute,
    string calldata subRoute,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public {
    // Require access to accessRoute
    if (!_hasAccess(accessRoute, msg.sender)) revert RouteAccessDenied(accessRoute, msg.sender);

    // Require a valid subRoute
    if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);

    // Construct the table route id by concatenating accessRoute and tableRoute
    uint256 tableRouteId = uint256(keccak256(abi.encodePacked(accessRoute, subRoute)));

    // Set the field
    StoreCore.setField(tableRouteId, key, schemaIndex, data);
  }

  /**
   * Write a field in a table based on specific access rights.
   * This overload exists to conform with the `IStore` interface.
   */
  function setField(
    uint256 tableRouteId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public override {
    // Check access based on the tableRoute
    if (!_hasAccess(bytes32(tableRouteId), msg.sender))
      revert RouteAccessDenied(RouteTable.get(bytes32(tableRouteId)), msg.sender);

    // Set the field
    StoreCore.setField(tableRouteId, key, schemaIndex, data);
  }

  /**
   * Delete a record in a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function deleteRecord(
    string calldata accessRoute,
    string calldata subRoute,
    bytes32[] calldata key
  ) public {
    // Require access to accessRoute
    if (!_hasAccess(accessRoute, msg.sender)) revert RouteAccessDenied(accessRoute, msg.sender);

    // Require a valid subRoute
    if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);

    // Construct the table route id by concatenating accessRoute and tableRoute
    uint256 tableRouteId = uint256(keccak256(abi.encodePacked(accessRoute, subRoute)));

    // Delete the record
    StoreCore.deleteRecord(tableRouteId, key);
  }

  /**
   * Delete a record in a table based on specific access rights.
   * This overload exists to conform with the `IStore` interface.
   */
  function deleteRecord(uint256 tableRouteId, bytes32[] calldata key) public override {
    // Check access based on the tableRoute
    if (!_hasAccess(bytes32(tableRouteId), msg.sender))
      revert RouteAccessDenied(RouteTable.get(bytes32(tableRouteId)), msg.sender);

    // Delete the record
    StoreCore.deleteRecord(tableRouteId, key);
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call a system based on a parent route access right
   * We check for access based on `accessRoute`, and execute `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes
   */
  function call(
    string calldata accessRoute,
    string memory subRoute,
    bytes calldata funcSelectorAndArgs
  ) public returns (bytes memory) {
    // Check if the system is a public system and get its address
    string memory systemRoute = string(abi.encodePacked(accessRoute, subRoute));
    bytes32 systemRouteId = keccak256(bytes(systemRoute));
    (address systemAddress, bool publicAccess) = SystemTable.get(systemRouteId);

    // If the system is not public, check for individual access
    if (!publicAccess) {
      // Require access to accessRoute
      if (!_hasAccess(accessRoute, msg.sender)) revert RouteAccessDenied(accessRoute, msg.sender);

      // Require a valid subRoute
      if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);
    }

    // Call the system and forward any return data
    return
      _call({
        msgSender: msg.sender,
        systemAddress: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs,
        delegate: _isSingleLevelRoute(systemRoute)
      });
  }

  /**
   * Overload for the function above to check access based on the full system route instead of a parent route (better devex for public systems)
   */
  function call(string calldata systemRoute, bytes calldata funcSelectorAndArgs) public returns (bytes memory) {
    return call(systemRoute, "", funcSelectorAndArgs);
  }

  /**
   * Internal function to call system with delegatecall/call, without access control
   */
  function _call(
    address msgSender,
    address systemAddress,
    bytes calldata funcSelectorAndArgs,
    bool delegate
  ) internal returns (bytes memory) {
    // Append msg.sender to the calldata
    bytes memory callData = abi.encodePacked(funcSelectorAndArgs, msgSender);

    // Call the system using `delegatecall` for root systems and `call` for others
    (bool success, bytes memory data) = delegate
      ? systemAddress.delegatecall(callData) // root system
      : systemAddress.call(callData); // non-root system

    // Forward returned data if the call succeeded
    if (success) return data;

    // Forward error if the call failed
    assembly {
      // data+32 is a pointer to the error message, mload(data) is the length of the error message
      revert(add(data, 0x20), mload(data))
    }
  }

  function _hasAccess(string calldata route, address caller) internal view returns (bool) {
    return _hasAccess(keccak256(bytes(route)), caller);
  }

  function _hasAccess(bytes32 routeId, address caller) internal view returns (bool) {
    return RouteAccessTable.get(routeId, caller);
  }
}

// A route is a string starting with `/` or an empty string
function _isRoute(string memory route) pure returns (bool result) {
  assembly {
    // If the route is empty, return true
    if eq(mload(route), 0) {
      result := 1
    }

    // If the first byte is `/` (ascii 0x2f), return true
    if eq(byte(0, mload(add(route, 0x20))), 0x2f) {
      result := 1
    }
  }
}

// A top level route contains exactly one `/` at the start
function _isSingleLevelRoute(string memory route) pure returns (bool result) {
  // Verify the route is empty or starts with `/`
  if (!_isRoute(route)) return false;

  // Loop through the string and return false if another `/` is found
  bytes memory routeBytes = bytes(route);
  for (uint256 i = 1; i < routeBytes.length; ) {
    if (routeBytes[i] == 0x2f) return false;
    unchecked {
      i++;
    }
  }

  // Return true if no `/` was found
  return true;
}
