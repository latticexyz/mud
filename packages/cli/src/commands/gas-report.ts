import type { CommandModule } from "yargs";
import { readFileSync, writeFileSync } from "fs";
import { execa } from "execa";
import chalk from "chalk";
import { table, getBorderCharacters } from "table";
import stripAnsi from "strip-ansi";

/**
 * Print the gas report to the console, save it to a file and compare it to a previous gas report if provided.
 * Requires forge to be installed, and gas test files including `// !gasreport` comments, like this:
 *
 * ```solidity
 * contract GasTest is DSTestPlus {
 *   function testBuffer() public pure {
 *     // !gasreport allocate a buffer
 *     Buffer buffer = Buffer_.allocate(32);
 *
 *     bytes32 value = keccak256("some data");
 *
 *     // !gasreport append 32 bytes to a buffer
 *     buffer.append(value);
 *  }
 * }
 * ```
 */

type Options = {
  path: string[];
  save?: string;
  compare?: string;
};

type GasReportEntry = {
  file: string;
  test: string;
  name: string;
  gasUsed: number;
  prevGasUsed?: number;
};

type GasReport = GasReportEntry[];

const commandModule: CommandModule<Options, Options> = {
  command: "gas-report",

  describe: "Create a gas report",

  builder(yargs) {
    return yargs.options({
      save: { type: "string", desc: "Save the gas report to a file" },
      compare: { type: "string", desc: "Compare to an existing gas report" },
    });
  },

  async handler({ save, compare }) {
    let gasReport: GasReport;
    try {
      gasReport = await runGasReport();
    } catch (error) {
      console.error(error);
      setTimeout(() => process.exit());
      return;
    }

    // If this gas report should be compared to an existing one, load the existing one
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
    if (save) saveGasReport(gasReport, save);

    process.exit(0);
  },
};

export default commandModule;

async function runGasReport(): Promise<GasReport> {
  console.log("Running gas report");
  const gasReport: GasReport = [];

  // Extract the logs from the child process
  let stdout: string;
  try {
    // Run the generated file using forge
    const child = execa("forge", ["test", "-vvv"], {
      stdio: ["inherit", "pipe", "inherit"],
    });
    stdout = (await child).stdout;
  } catch (error: any) {
    console.log(error.stdout ?? error);
    console.log(chalk.red("\n-----------\nError while running the gas report (see above)"));
    throw error;
  }

  // Extract the gas reports from the logs
  const lines = stdout.split("\n").map(stripAnsi);
  const gasReportPattern = /^\s*GAS REPORT: (\d+) (.*)$/;
  const testFunctionPattern = /^\[(?:PASS|FAIL).*\] (\w+)\(\)/;
  const testFilePattern = /^Running \d+ tests? for (.*):(.*)$/;

  function nearestLine(pattern: RegExp, startIndex: number = lines.length - 1): number {
    for (let i = startIndex; i >= 0; i--) {
      const line = lines[i];
      if (pattern.test(line)) {
        return i;
      }
    }
    return -1;
  }

  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(gasReportPattern);
    if (!matches) continue;

    const gasUsed = parseInt(matches[1]);
    const name = matches[2];

    const testFunctionLineIndex = nearestLine(testFunctionPattern, i);
    if (testFunctionLineIndex === -1) {
      throw new Error("Could not find nearest test function, did `forge test` output change?");
    }
    const testFileLineIndex = nearestLine(testFilePattern, testFunctionLineIndex);
    if (testFileLineIndex === -1) {
      throw new Error("Could not find nearest test filename, did `forge test` output change?");
    }

    const functionMatches = lines[testFunctionLineIndex].match(testFunctionPattern);
    if (!functionMatches) {
      throw new Error("Could not parse test function name, did `forge test` output change?");
    }
    const fileMatches = lines[testFileLineIndex].match(testFilePattern);
    if (!fileMatches) {
      throw new Error("Could not parse test filename, did `forge test` output change?");
    }

    const test = functionMatches[1];
    const file = fileMatches[1];

    gasReport.push({ file, test, name, gasUsed });
  }

  gasReport.sort((a, b) => a.file.localeCompare(b.file));

  return gasReport;
}

function printGasReport(gasReport: GasReport, compare?: string) {
  if (compare) console.log(chalk.bold(`Gas report compared to ${compare}`));

  const headers = [
    chalk.bold("File"),
    chalk.bold("Test"),
    chalk.bold("Name"),
    chalk.bold("Gas used"),
    ...(compare ? [chalk.bold("Prev gas used"), chalk.bold("Difference")] : []),
  ];

  const values = gasReport.map((entry) => {
    const diff = entry.prevGasUsed ? entry.gasUsed - entry.prevGasUsed : 0;
    const diffEntry = diff > 0 ? chalk.red(`+${diff}`) : diff < 0 ? chalk.green(`${diff}`) : diff;
    const compareColumns = compare ? [entry.prevGasUsed ?? "n/a", diffEntry] : [];
    const gasUsedEntry = diff > 0 ? chalk.red(entry.gasUsed) : diff < 0 ? chalk.green(entry.gasUsed) : entry.gasUsed;
    return [entry.file, entry.test, entry.name, gasUsedEntry, ...compareColumns];
  });

  const rows = [headers, ...values];

  console.log(table(rows, { border: getBorderCharacters("norc") }));
}

function saveGasReport(gasReport: GasReport, path: string) {
  console.log(chalk.bold(`Saving gas report to ${path}`));
  writeFileSync(path, `${JSON.stringify(gasReport, null, 2)}\n`);
}
