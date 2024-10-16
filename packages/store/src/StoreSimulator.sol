// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStore } from "./IStore.sol";
import { Create2 } from "./vendor/Create2.sol";

contract StoreProxy {
  address public store;

  constructor(address _store) {
    store = _store;
  }

  fallback() external payable {
    (bool success, bytes memory result) = store.call(msg.data);
    require(success, "Forwarding call to Store failed");
    assembly {
      return(add(result, 0x20), mload(result))
    }
  }

  receive() external payable {
    // Forward ETH to target if necessary
    (bool success, ) = store.call{ value: msg.value }("");
    require(success, "Forwarding ETH to Store failed");
  }
}

contract StoreSimulator {
  error CallResult(bool success, bytes data);

  function getProxyAddress(address store) public view returns (address) {
    return Create2.computeAddress(0, keccak256(_getBytecode(store)));
  }

  function call(address store, bytes calldata callData) external {
    address proxy = Create2.deploy(0, 0, _getBytecode(store));
    (bool success, bytes memory data) = proxy.call(callData);
    revert CallResult(success, data);
  }

  function _getBytecode(address store) internal pure returns (bytes memory) {
    return abi.encodePacked(type(StoreProxy).creationCode, abi.encode(store));
  }
}
