// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Create2 } from "./vendor/Create2.sol";
import { IStore } from "./IStore.sol";
import { EncodedLengths } from "./EncodedLengths.sol";
import { ResourceId } from "./ResourceId.sol";
import { StoreCore } from "./StoreCore.sol";

contract StoreProxy {
  address public store;
  bytes[] private calls;

  constructor(address _store) {
    store = _store;
  }

  function _calls() public view returns (bytes[] memory) {
    return calls;
  }

  fallback() external payable {
    calls.push(msg.data);
    (bool success, bytes memory result) = store.call(msg.data);
    if (!success) {
      assembly {
        let returndata_size := mload(result)
        revert(add(result, 0x20), returndata_size)
      }
    }
    assembly {
      return(add(result, 0x20), mload(result))
    }
  }

  receive() external payable {
    (bool success, bytes memory result) = store.call{ value: msg.value }("");
    if (!success) {
      assembly {
        let returndata_size := mload(result)
        revert(add(result, 0x20), returndata_size)
      }
    }
  }
}

contract StoreSimulator {
  error CallResult(bool success, bytes data, bytes[] calls);

  function getProxyAddress(address store) public view returns (address) {
    return Create2.computeAddress(0, keccak256(_getBytecode(store)));
  }

  function call(address store, bytes calldata callData) external {
    address proxy = Create2.deploy(0, 0, _getBytecode(store));
    (bool success, bytes memory data) = proxy.call(callData);
    revert CallResult(success, data, StoreProxy(payable(proxy))._calls());
  }

  function _getBytecode(address store) internal pure returns (bytes memory) {
    return abi.encodePacked(type(StoreProxy).creationCode, abi.encode(store));
  }
}
