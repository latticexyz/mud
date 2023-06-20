// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "./IStore.sol";
import { StoreConsumer } from "./StoreConsumer.sol";

/**
 * When making a hook, prefer inheriting StoreHook over IStoreHook for convenience
 * (hooks should use the default StoreConsumer).
 */
abstract contract StoreHook is IStoreHook, StoreConsumer {

}
