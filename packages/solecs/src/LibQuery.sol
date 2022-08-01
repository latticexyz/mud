// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;
import { IComponent } from "./interfaces/IComponent.sol";
import { QueryFragment, QueryType } from "./interfaces/Query.sol";
import "memmove/LinkedList.sol";

struct Uint256Node {
  uint256 value;
  uint256 next;
}

function pointer(Uint256Node memory a) pure returns (bytes32 ptr) {
  /// @solidity memory-safe-assembly
  assembly {
    ptr := a
  }
}

function fromPointer(bytes32 ptr) pure returns (Uint256Node memory a) {
  /// @solidity memory-safe-assembly
  assembly {
    a := ptr
  }
}

function isPositiveFragment(QueryFragment memory fragment) pure returns (bool) {
  return fragment.queryType == QueryType.Has || fragment.queryType == QueryType.HasValue;
}

function isNegativeFragment(QueryFragment memory fragment) pure returns (bool) {
  return fragment.queryType == QueryType.Not || fragment.queryType == QueryType.NotValue;
}

function isSettingFragment(QueryFragment memory fragment) pure returns (bool) {
  return fragment.queryType == QueryType.ProxyRead || fragment.queryType == QueryType.ProxyExpand;
}

function isEntityFragment(QueryFragment memory fragment) pure returns (bool) {
  return
    fragment.queryType == QueryType.Has ||
    fragment.queryType == QueryType.HasValue ||
    fragment.queryType == QueryType.Not ||
    fragment.queryType == QueryType.NotValue;
}

function passesQueryFragment(uint256 entity, QueryFragment memory fragment) view returns (bool) {
  if (fragment.queryType == QueryType.Has) {
    // Entity must have given component
    return fragment.component.has(entity);
  }

  if (fragment.queryType == QueryType.HasValue) {
    // Entity must have the given component value
    return keccak256(fragment.value) == keccak256(fragment.component.getRawValue(entity));
  }

  if (fragment.queryType == QueryType.Not) {
    // Entity must not have the given value
    return !fragment.component.has(entity);
  }

  if (fragment.queryType == QueryType.NotValue) {
    // Entity must not have the given component value
    return keccak256(fragment.value) != keccak256(fragment.component.getRawValue(entity));
  }

  require(isEntityFragment(fragment), "NO_ENTITY_FRAGMENT");
  return false;
}

function passesQueryFragmentProxy(
  uint256 entity,
  QueryFragment memory fragment,
  QueryFragment memory proxyRead
) view returns (bool passes, bool proxyFound) {
  require(isEntityFragment(fragment), "NO_ENTITY_FRAGMENT");
  require(proxyRead.queryType == QueryType.ProxyRead, "NO_PROXY_READ_FRAGMENT");

  uint256 proxyEntity = entity;

  for (uint256 i; i < abi.decode(proxyRead.value, (uint256)); i++) {
    // If the current entity does not have the proxy component, abort
    if (!proxyRead.component.has(proxyEntity)) {
      return (passes, false);
    }

    // Move up the proxy chain
    proxyEntity = abi.decode(proxyRead.component.getRawValue(proxyEntity), (uint256));
    passes = passesQueryFragment(proxyEntity, fragment);

    if (isBreakingPassState(passes, fragment)) {
      return (passes, true);
    }
  }
  return (passes, true);
}

// For positive fragments (Has/HasValue) we need to find any passing entity up the proxy chain
// so as soon as passes is true, we can early return. For negative fragments (Not/NotValue) every entity
// up the proxy chain must pass, so we can early return if we find one that doesn't pass.
function isBreakingPassState(bool passes, QueryFragment memory fragment) pure returns (bool) {
  return (passes && isPositiveFragment(fragment)) || (!passes && isNegativeFragment(fragment));
}

struct QueryVars {
  LinkedList entities;
  uint256 numEntities;
  QueryFragment proxyRead;
  QueryFragment proxyExpand;
  bool initialFragment;
}

library LibQuery {
  using LinkedListLib for LinkedList;

  function query(QueryFragment[] memory fragments) internal view returns (uint256[] memory) {
    QueryVars memory v;
    v.entities = LinkedListLib.newLinkedList(32);
    v.numEntities = 0;
    v.proxyRead;
    v.proxyExpand;
    v.initialFragment = true;

    // Process fragments
    for (uint256 i; i < fragments.length; i++) {
      QueryFragment memory fragment = fragments[i];
      if (isSettingFragment(fragment)) {
        // Store setting fragments for subsequent query fragments
        if (fragment.queryType == QueryType.ProxyRead) v.proxyRead = fragment;
        if (fragment.queryType == QueryType.ProxyExpand) v.proxyExpand = fragment;
      } else if (v.initialFragment) {
        // Handle entity query fragments
        // First regular fragment must be Has or HasValue
        require(isPositiveFragment(fragment), "NEGATIVE_INITIAL_FRAGMENT");
        v.initialFragment = false;

        // Create the first interim result
        uint256[] memory entityArray = fragment.queryType == QueryType.Has
          ? fragment.component.getEntities()
          : fragment.component.getEntitiesWithValue(fragment.value);

        v.entities = arrayToList(entityArray);
        v.numEntities = entityArray.length;

        // Add entity's children up to the specified depth if proxy expand is active,
        if ((address(v.proxyExpand.component) != address(0)) && abi.decode(v.proxyExpand.value, (uint256)) > 0) {
          for (uint256 ctr; ctr < entityArray.length; ctr++) {
            uint256[] memory childEntities = getChildEntities(
              entityArray[ctr],
              v.proxyExpand.component,
              abi.decode(v.proxyExpand.value, (uint256))
            );

            for (uint256 childIndex; childIndex < childEntities.length; childIndex++) {
              v.entities = v.entities.push_and_link(pointer(Uint256Node(childEntities[childIndex], 0)));
              v.numEntities++;
            }
          }
        }
      } else {
        // There already is an interim result, apply the current fragment
        LinkedList nextEntities = LinkedListLib.newLinkedList(32);
        uint256 nextNumEntities = 0;
        bool success = true;
        bytes32 element = v.entities.head();

        // Iterate through the current interim result
        while (success) {
          Uint256Node memory node = fromPointer(element);
          uint256 entity = node.value;

          // Branch 1: Simple / check if the current entity passes the query fragment
          bool passes = passesQueryFragment(entity, fragment);

          // Branch 2: Proxy upwards / check if proxy entity passes the query
          passes = _processProxyRead(v, fragment, entity, passes);

          // If the entity passes the query fragment, add it to the new interim result
          if (passes) {
            nextEntities = nextEntities.push_and_link(pointer(Uint256Node(entity, 0)));
            nextNumEntities++;
          }

          // Branch 3: Proxy downwards / run the query fragments on child entities if proxy expand is active
          (nextEntities, nextNumEntities) = _processProxyExpand(v, fragment, entity, nextEntities, nextNumEntities);

          // Move to the next entity
          (success, element) = v.entities.next(element);
        }

        // Update interim result
        v.entities = nextEntities;
        v.numEntities = nextNumEntities;
      }
    }

    return listToArray(v.entities, v.numEntities);
  }

  // Branch 2: Proxy upwards / check if proxy entity passes the query
  function _processProxyRead(
    QueryVars memory v,
    QueryFragment memory fragment,
    uint256 entity,
    bool passes
  ) internal view returns (bool) {
    if (
      address(v.proxyRead.component) != address(0) &&
      abi.decode(v.proxyRead.value, (uint256)) > 0 &&
      !isBreakingPassState(passes, fragment)
    ) {
      (bool newPasses, bool proxyFound) = passesQueryFragmentProxy(entity, fragment, v.proxyRead);
      if (proxyFound) return newPasses;
    }
    return passes;
  }

  // Branch 3: Proxy downwards / run the query fragments on child entities if proxy expand is active
  function _processProxyExpand(
    QueryVars memory v,
    QueryFragment memory fragment,
    uint256 entity,
    LinkedList nextEntities,
    uint256 nextNumEntities
  ) internal view returns (LinkedList, uint256) {
    if ((address(v.proxyExpand.component) != address(0)) && abi.decode(v.proxyExpand.value, (uint256)) > 0) {
      uint256[] memory childEntities = getChildEntities(
        entity,
        v.proxyExpand.component,
        abi.decode(v.proxyExpand.value, (uint256))
      );

      for (uint256 ctr; ctr < childEntities.length; ctr++) {
        uint256 childEntity = childEntities[ctr];

        // Add the child entity if it passes the direct check
        bool childPasses = passesQueryFragment(childEntity, fragment);

        // or if a proxy read is active and it passes the proxy read check
        if (
          !childPasses && address(v.proxyRead.component) != address(0) && abi.decode(v.proxyRead.value, (uint256)) > 0
        ) {
          (bool proxyPasses, bool proxyFound) = passesQueryFragmentProxy(childEntity, fragment, v.proxyRead);
          if (proxyFound) childPasses = proxyPasses;
        }

        if (childPasses) {
          nextEntities = nextEntities.push_and_link(pointer(Uint256Node(entity, 0)));
          nextNumEntities++;
        }
      }
    }

    return (nextEntities, nextNumEntities);
  }

  /**
   * Recursively computes all direct and indirect child entities up to the specified depth
   * @param entity Entity to get all child entities up to the specified depth
   * @param component Entity reference component
   * @param depth Depth up to which the recursion should be applied
   * returns Set of entities that are child entities of the given entity via the given component
   */
  function getChildEntities(
    uint256 entity,
    IComponent component,
    uint256 depth
  ) internal view returns (uint256[] memory) {
    if (depth == 0) return new uint256[](0);

    uint256[] memory directChildren = component.getEntitiesWithValue(abi.encode(entity));
    if (depth == 1) return directChildren;

    LinkedList indirectChildList = LinkedListLib.newLinkedList(32);
    uint256 numIndirectChildren = 0;

    for (uint256 i; i < directChildren.length; i++) {
      uint256[] memory indirectChildren = getChildEntities(directChildren[i], component, depth - 1);
      for (uint256 j; j < indirectChildren.length; j++) {
        indirectChildList = indirectChildList.push_and_link(pointer(Uint256Node(indirectChildren[j], 0)));
        numIndirectChildren++;
      }
    }

    uint256[] memory allChildren = listToArray(indirectChildList, numIndirectChildren + directChildren.length);
    for (uint256 i; i < directChildren.length; i++) {
      allChildren[numIndirectChildren + i] = directChildren[i];
    }

    return allChildren;
  }

  function getValueWithProxy(
    IComponent component,
    uint256 entity,
    IComponent proxyComponent,
    uint256 depth
  ) internal view returns (bytes memory value, bool found) {
    uint256 proxyEntity = entity;
    for (uint256 i; i <= depth; i++) {
      // Check if the current entity has the requested value
      if (component.has(proxyEntity)) return (component.getRawValue(proxyEntity), true);

      // Abort if the current entity has no value in the proxy component
      if (!proxyComponent.has(proxyEntity)) {
        return (new bytes(0), false);
      }

      // Move up the proxy chain
      proxyEntity = abi.decode(proxyComponent.getRawValue(proxyEntity), (uint256));
    }

    return (new bytes(0), false);
  }

  function listToArray(LinkedList list, uint256 length) public pure returns (uint256[] memory array) {
    array = new uint256[](length);
    if (length == 0) return array;

    bool success = true;
    bytes32 element = list.head();
    uint256 i = 0;

    while (success) {
      Uint256Node memory node = fromPointer(element);
      array[i] = node.value;
      i++;
      (success, element) = list.next(element);
    }
  }

  function arrayToList(uint256[] memory array) public pure returns (LinkedList list) {
    list = LinkedListLib.newLinkedList(32);
    for (uint256 i; i < array.length; i++) {
      list = list.push_and_link(pointer(Uint256Node(array[i], 0)));
    }
  }
}
