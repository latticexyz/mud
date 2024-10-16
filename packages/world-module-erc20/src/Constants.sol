// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

library ModuleConstants {
  bytes14 constant NAMESPACE = "erc20-module";
  bytes16 constant REGISTRY_TABLE_NAME = "ERC20_REGISTRY";
}

library ERC20TableNames {
  bytes16 constant TOTAL_SUPPLY = "TOTAL_SUPPLY";

  bytes16 constant BALANCES = "BALANCES";

  bytes16 constant ALLOWANCES = "ALLOWANCES";

  bytes16 constant METADATA = "METADATA";
}

library OwnableTableNames {
  bytes16 constant OWNER = "OWNER";
}

library PausableTableNames {
  bytes16 constant PAUSED = "PAUSED";
}
