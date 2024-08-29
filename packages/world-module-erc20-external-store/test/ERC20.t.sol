// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { ERC20 } from "../src/ERC20.sol";
// import { Token } from "../src/codegen/tables/Token.sol";
// import { Balances } from "../src/codegen/tables/Balances.sol";
// import { Allowances } from "../src/codegen/tables/Allowances.sol";
contract tokenTest is Test, GasReporter {
  ERC20 token;
}
