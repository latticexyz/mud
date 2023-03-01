// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { RouteOwnerTable } from "./tables/RouteOwnerTable.sol";
import { RouteAccess } from "./tables/RouteAccess.sol";
import { RouteTable } from "./tables/RouteTable.sol";
import { SystemRouteTable } from "./tables/SystemRouteTable.sol";
import { SystemTable } from "./tables/SystemTable.sol";
import { System } from "./System.sol";
import { ISystemHook } from "./ISystemHook.sol";

uint256 constant ROOT_ROUTE_ID = uint256(keccak256(bytes("")));
bytes32 constant SINGLE_SLASH = "/";

contract World is Store {
  error RouteInvalid(string route);
  error RouteExists(string route);
  error RouteAccessDenied(string route, address caller);
  error SystemExists(address system);

  constructor() {
    SystemTable.registerSchema();
    RouteTable.registerSchema();
    RouteAccess.registerSchema();
    SystemRouteTable.registerSchema();
    RouteOwnerTable.registerSchema();

    // Register root route and give ownership to msg.sender
    RouteTable.set({ routeId: ROOT_ROUTE_ID, route: "" }); // Storing this explicitly to trigger the event for indexers
    RouteOwnerTable.set({ routeId: ROOT_ROUTE_ID, owner: msg.sender });
    RouteAccess.set({ routeId: ROOT_ROUTE_ID, caller: msg.sender, value: true });
  }

  /************************************************************************
   *
   *    REGISTRATION METHODS
   *
   ************************************************************************/

  /**
   * Register a new route by extending an existing route
   */
  function registerRoute(string calldata baseRoute, string calldata subRoute) public virtual returns (uint256 routeId) {
    // Require subroute to be a valid route fragment (start with `/` and don't contain any further `/`)
    if (!_isSingleLevelRoute(subRoute)) revert RouteInvalid(subRoute);

    // Require base route to exist (with a special check for the root route because it's empty and fails the `has` check)
    uint256 baseRouteId = _toRouteId(baseRoute);
    if (!(baseRouteId == ROOT_ROUTE_ID || RouteTable.has(baseRouteId))) revert RouteInvalid(baseRoute);

    // Require subRoute to not be empty
    if (bytes(subRoute).length == 0) revert RouteInvalid(subRoute);

    // Construct the new route
    string memory route = string(abi.encodePacked(baseRoute, subRoute));
    routeId = _toRouteId(route);

    // Require route to not exist yet
    if (RouteTable.has(routeId)) revert RouteExists(route);

    // Store the route
    RouteTable.set({ routeId: routeId, route: route });

    // Add caller as owner of the new route
    RouteOwnerTable.set({ routeId: routeId, owner: msg.sender });

    // Give caller access to the route
    RouteAccess.set({ routeId: routeId, caller: msg.sender, value: true });
  }

  /**
   * Register register a table with given schema at the given route
   */
  function registerTable(
    string calldata baseRoute,
    string calldata tableRoute,
    Schema schema
  ) public virtual returns (uint256 tableRouteId) {
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
  function registerSchema(uint256 tableId, Schema schema) public virtual override {
    // Require caller to own the given tableId
    if (RouteOwnerTable.get(tableId) != msg.sender) revert RouteAccessDenied(RouteTable.get(tableId), msg.sender);

    // Register the schema
    StoreCore.registerSchema(tableId, schema);
  }

  /**
   * Register metadata (tableName, fieldNames) for a given table via its route
   */
  function setMetadata(
    string calldata tableRoute,
    string calldata tableName,
    string[] calldata fieldNames
  ) public virtual {
    setMetadata(_toRouteId(tableRoute), tableName, fieldNames);
  }

  /**
   * Register metadata (tableName, fieldNames) for a given table via its id
   */
  function setMetadata(uint256 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    // Require caller to own the given tableId
    if (RouteOwnerTable.get(tableId) != msg.sender) revert RouteAccessDenied(RouteTable.get(tableId), msg.sender);

    // Set the table's metadata
    StoreCore.setMetadata(tableId, tableName, fieldNames);
  }

  /**
   * Register a hook for a given table route
   */
  function registerTableHook(string calldata tableRoute, IStoreHook hook) public virtual {
    registerStoreHook(_toRouteId(tableRoute), hook);
  }

  /**
   * Register a hook for a given table route id
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public virtual override {
    // Require caller to own the given tableId
    if (RouteOwnerTable.get(tableId) != msg.sender) revert RouteAccessDenied(RouteTable.get(tableId), msg.sender);

    // Register the hook
    StoreCore.registerStoreHook(tableId, hook);
  }

  /**
   * Register a hook for a given system route
   */
  function registerSystemHook(string calldata systemRoute, ISystemHook hook) public virtual {
    // TODO implement (see https://github.com/latticexyz/mud/issues/444)
  }

  /**
   * Register a system at the given route
   */
  function registerSystem(
    string calldata baseRoute,
    string calldata systemRoute,
    System system,
    bool publicAccess
  ) public virtual returns (uint256 systemRouteId) {
    // Require the system to not exist yet
    if (SystemRouteTable.has(address(system))) revert SystemExists(address(system));

    // Require the caller to own the base route
    uint256 baseRouteId = _toRouteId(baseRoute);
    if (RouteOwnerTable.get(baseRouteId) != msg.sender) revert RouteAccessDenied(baseRoute, msg.sender);

    // Register system route
    systemRouteId = registerRoute(baseRoute, systemRoute);

    // Store the system address in the system table
    SystemTable.set({ routeId: systemRouteId, system: address(system), publicAccess: publicAccess });

    // Store the system's route in the SystemToRoute table
    SystemRouteTable.set({ system: address(system), routeId: systemRouteId });

    // Give the system access to its base route
    RouteAccess.set({ routeId: baseRouteId, caller: address(system), value: true });
  }

  /**
   * Grant access to a given route
   */
  function grantAccess(string calldata route, address grantee) public virtual {
    // Require the caller to own the route
    uint256 routeId = _toRouteId(route);
    if (RouteOwnerTable.get(routeId) != msg.sender) revert RouteAccessDenied(route, msg.sender);

    // Grant access to the given route
    RouteAccess.set({ routeId: routeId, caller: grantee, value: true });
  }

  /**
   * Retract access to a given route
   */
  function retractAccess(string calldata route, address grantee) public virtual {
    // Require the caller to own the route
    uint256 routeId = _toRouteId(route);
    if (RouteOwnerTable.get(routeId) != msg.sender) revert RouteAccessDenied(route, msg.sender);

    // Retract access to the given route
    RouteAccess.deleteRecord({ routeId: routeId, caller: grantee });
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
  ) public virtual {
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
  function setRecord(uint256 tableRouteId, bytes32[] calldata key, bytes calldata data) public virtual {
    // Check access based on the tableRoute
    if (!_hasAccess(tableRouteId, msg.sender)) revert RouteAccessDenied(RouteTable.get(tableRouteId), msg.sender);

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
  ) public virtual {
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
  ) public virtual override {
    // Check access based on the tableRoute
    if (!_hasAccess(tableRouteId, msg.sender)) revert RouteAccessDenied(RouteTable.get(tableRouteId), msg.sender);

    // Set the field
    StoreCore.setField(tableRouteId, key, schemaIndex, data);
  }

  /**
   * Push data to the end of a field in a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function pushToField(
    string calldata accessRoute,
    string calldata subRoute,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public {
    // Check access based on accessRoute
    uint256 tableRouteId = _verifiedTableRouteId(accessRoute, subRoute);

    // Push to the field
    StoreCore.pushToField(tableRouteId, key, schemaIndex, dataToPush);
  }

  /**
   * Push data to the end of a field in a table based on specific access rights.
   * This overload exists to conform with the `IStore` interface.
   */
  function pushToField(
    uint256 tableRouteId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    // Check access based on the tableRoute
    if (!_hasAccess(tableRouteId, msg.sender)) revert RouteAccessDenied(RouteTable.get(tableRouteId), msg.sender);

    // Push to the field
    StoreCore.pushToField(tableRouteId, key, schemaIndex, dataToPush);
  }

  /**
   * Delete a record in a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function deleteRecord(string calldata accessRoute, string calldata subRoute, bytes32[] calldata key) public virtual {
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
  function deleteRecord(uint256 tableRouteId, bytes32[] calldata key) public virtual override {
    // Check access based on the tableRoute
    if (!_hasAccess(tableRouteId, msg.sender)) revert RouteAccessDenied(RouteTable.get(tableRouteId), msg.sender);

    // Delete the record
    StoreCore.deleteRecord(tableRouteId, key);
  }

  /**
   * Check for access based on `accessRoute`
   * and return `tableRouteId` for `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function _verifiedTableRouteId(string calldata accessRoute, string calldata subRoute)
    internal
    view
    returns (uint256 tableRouteId)
  {
    // Require access to accessRoute
    if (!_hasAccess(accessRoute, msg.sender)) revert RouteAccessDenied(accessRoute, msg.sender);

    // Require a valid subRoute
    if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);

    // Construct the table route id by concatenating accessRoute and tableRoute
    tableRouteId = uint256(keccak256(abi.encodePacked(accessRoute, subRoute)));
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
  ) public virtual returns (bytes memory) {
    // Check if the system is a public virtual system and get its address
    string memory systemRoute = string(abi.encodePacked(accessRoute, subRoute));
    uint256 systemRouteId = _toRouteId(systemRoute);
    (address systemAddress, bool publicAccess) = SystemTable.get(systemRouteId);

    // If the system is not public virtual, check for individual access
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
   * Overload for the function above to check access based on the full system route instead of a parent route (better devex for public virtual systems)
   */
  function call(string calldata systemRoute, bytes calldata funcSelectorAndArgs) public virtual returns (bytes memory) {
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
    return _hasAccess(_toRouteId(route), caller);
  }

  function _hasAccess(uint256 routeId, address caller) internal view returns (bool) {
    return RouteAccess.get(routeId, caller);
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

    // If the route is only `/`, return false
    if eq(mload(route), 1) {
      result := 0
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

function _toRouteId(string memory route) pure returns (uint256) {
  return uint256(keccak256(bytes(route)));
}
