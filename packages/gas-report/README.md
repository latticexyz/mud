# Gas Report

Gas reporter for specific lines within forge tests

Add some reports to your forge tests

```solidity
import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

contract ExampleTest is Test, GasReporter {
  function testGas() public {
    startGasReport("Describe what is being gas-reported on");
    // do something here
    endGasReport();
  }
}
```

Then use the cli command to run tests and save the report:

```console
pnpm mud-gas-report --save gas-report.json
```

Run `pnpm mud-gas-report --help` for more details.
