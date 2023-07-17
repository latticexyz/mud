// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "./IStore.sol";

/**
 * When making a hook, prefer inheriting StoreHook over IStoreHook for convenience.
 */
abstract contract StoreHook is IStoreHook {

}
