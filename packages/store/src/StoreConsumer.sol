// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreConsumer } from "./IStore.sol";

/**
 * Default Store consumers consider their caller to be the Store, thus delegating access control to the Store.
 * The Store contract considers itself to be the Store (so StoreRead has a different storeAddress definition).
 * Tests/scripts may override this value for convenience.
 */
contract StoreConsumer is IStoreConsumer {
  function storeAddress(address msgSender) public pure returns (address) {
    return msgSender;
  }
}
