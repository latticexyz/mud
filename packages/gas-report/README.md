# Gas Report

Measure and report gas usage within forge tests

Add some reports to your forge tests

```solidity
import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

contract ExampleTest is Test, GasReporter {
  function testGas() public {
    startGasReport("description of behavior to measure gas for");
    // do something here
    endGasReport();
  }
}
```

Then use the cli command to run tests and save the report:

```console
pnpm gas-report --save gas-report.json
```

Or, if you have your own test command, you can pipe the output to `gas-report --stdin`:

```console
GAS_REPORTER_ENABLED=true forge test -vvv | pnpm gas-report --stdin
```

Run `pnpm gas-report --help` for more details.
