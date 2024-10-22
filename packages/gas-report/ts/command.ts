import type { CommandModule } from "yargs";
import { readFileSync } from "fs";
import chalk from "chalk";
import { runGasReport } from "./runGasReport";
import { printGasReport } from "./printGasReport";
import { saveGasReport } from "./saveGasReport";
import { CommandOptions, GasReport } from "./common";

/**
 * Print the gas report to the console, save it to a file and compare it to a previous gas report if provided.
 *
 * Requires foundry to be installed. Inherit from GasReporter and use startGasReport/endGasReport to measure gas used.
 *
 * ```solidity
 * contract MyContractTest is Test, GasReporter {
 *   function testBuffer() public pure {
 *     startGasReport("allocate a buffer");
 *     Buffer buffer = Buffer_.allocate(32);
 *     endGasReport();
 *
 *     bytes32 value = keccak256("some data");
 *
 *     startGasReport("append 32 bytes to a buffer");
 *     buffer.append(value);
 *     endGasReport();
 *  }
 * }
 * ```
 */

export const command: CommandModule<CommandOptions, CommandOptions> = {
  command: "gas-report",

  describe: "Create a gas report",

  builder(yargs) {
    return yargs.options({
      save: { type: "string", desc: "Save the gas report to a file" },
      compare: { type: "string", desc: "Compare to an existing gas report" },
      stdin: {
        type: "boolean",
        desc: "Parse the gas report logs from stdin instead of running an internal test command",
      },
    });
  },

  async handler(options) {
    let gasReport: GasReport;
    try {
      gasReport = await runGasReport(options);
    } catch (error) {
      console.error(error);
      setTimeout(() => process.exit());
      return;
    }

    // If this gas report should be compared to an existing one, load the existing one
    let { compare } = options;
    if (compare) {
      try {
        const compareGasReport: GasReport = JSON.parse(readFileSync(compare, "utf8"));
        // Merge the previous gas report with the new one
        gasReport = gasReport.map((entry) => {
          const prevEntry = compareGasReport.find((e) => e.file === entry.file && e.name === entry.name);
          return { ...entry, prevGasUsed: prevEntry?.gasUsed };
        });
      } catch {
        console.log(chalk.red(`Gas report to compare not found: ${compare}`));
        compare = undefined;
      }
    }

    // Print gas report
    printGasReport(gasReport, compare);

    // Save gas report to file if requested
    if (options.save) saveGasReport(gasReport, options.save);

    process.exit(0);
  },
};
