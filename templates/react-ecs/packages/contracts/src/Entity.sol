// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

type Entity is bytes32;

using EntityInstance for Entity global;

library EntityInstance {
  function unwrap(Entity entity) internal pure returns (bytes32) {
    return Entity.unwrap(entity);
  }

  function equals(Entity a, Entity b) internal pure returns (bool) {
    return Entity.unwrap(a) == Entity.unwrap(b);
  }

  function isEmpty(Entity entity) internal pure returns (bool) {
    return Entity.unwrap(entity) == 0;
  }
}
