// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { WithMsgSender } from "./WithMsgSender.sol";

// For now System is just an alias for `WithMsgSender`,
// but we might add more default functionality in the future.
contract System is WithMsgSender {

}
