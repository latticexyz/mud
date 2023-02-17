// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { StoreView } from "store/StoreView.sol";
import { StoreCore } from "store/StoreCore.sol";
import { Schema } from "store/Schema.sol";

import { OwnerTable, tableId as OwnerTableId } from "./tables/OwnerTable.sol";
import { RouteAccessTable } from "./tables/RouteAccessTable.sol";
import { RouteTable } from "./tables/RouteTable.sol";
import { SystemRouteTable } from "./tables/SystemRouteTable.sol";
import { SystemTable } from "./tables/SystemTable.sol";
import { System } from "./System.sol";

bytes32 constant ROOT_ROUTE_ID = keccak256(bytes(""));

contract World is StoreView {
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
  ) public returns (bytes32 tableRouteId) {
    // Register table route
    tableRouteId = registerRoute(baseRoute, tableRoute);

    // StoreCore handles checking for existence
    StoreCore.registerSchema(tableRouteId, schema);
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
   * Write to a table based on a parent route access right.
   * We check for access based on `accessRoute`, and write to `accessRoute/subRoute`
   * because access to a route also grants access to all sub routes.
   */
  function setRecord(
    string calldata accessRoute,
    string calldata subRoute,
    bytes32[] calldata key,
    bytes calldata data
  ) public {
    // Check access control based on the `accessRoute`
    bytes32 accessRouteId = keccak256(bytes(accessRoute));
    if (!RouteAccessTable.get({ routeId: accessRouteId, caller: msg.sender }))
      revert RouteAccessDenied(accessRoute, msg.sender);

    // Require subRoute to be a valid route
    if (!_isRoute(subRoute)) revert RouteInvalid(subRoute);

    // Construct the table route id by concatenating accessRoute and tableRoute
    bytes32 tableRouteId = keccak256(abi.encodePacked(accessRoute, subRoute));

    // Set the record
    StoreCore.setRecord(tableRouteId, key, data);
  }

  /**
   * Write to a table based on specific access rights.
   * This overload exists to conform with the `IStore` interface.
   */
  function setRecord(
    bytes32 tableRouteId,
    bytes32[] calldata key,
    bytes calldata data
  ) public override {
    // Check access based on the tableRoute
    if (!RouteAccessTable.get({ routeId: tableRouteId, caller: msg.sender })) revert RouteAccessDenied("", msg.sender);

    // Set the record
    StoreCore.setRecord(tableRouteId, key, data);
  }

  // TODO: add functions for `setField` and `deleteRecord` akin to `setRecord`

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
      bytes32 accessRouteId = keccak256(bytes(accessRoute));
      bool access = RouteAccessTable.get({ routeId: accessRouteId, caller: msg.sender });
      if (!access) revert RouteAccessDenied(accessRoute, msg.sender);

      // Require subRoute to be a valid route
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
}

// A route is a string starting with `/` or an empty string
function _isRoute(string memory) pure returns (bool) {
  // TODO: implement
  return true;
}

// A top level route contains exactly one `/` at the start
function _isSingleLevelRoute(string memory) pure returns (bool) {
  // TODO: implement
  return true;
}
