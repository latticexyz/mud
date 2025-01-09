import { execa } from "execa";
import chalk from "chalk";
import stripAnsi from "strip-ansi";
import toArray from "stream-to-array";
import { CommandOptions, GasReport } from "./common";

export async function runGasReport(options: CommandOptions): Promise<GasReport> {
  console.log("Running gas report");
  const gasReport: GasReport = [];

  // Extract the logs from the child process
  let logs: string;
  try {
    if (options.stdin) {
      // Read the logs from stdin and pipe them to stdout for visibility
      console.log("Waiting for stdin...");
      process.stdin.pipe(process.stdout);
      logs = (await toArray(process.stdin)).map((chunk) => chunk.toString()).join("\n");
      console.log("Done reading stdin");
    } else {
      // Run the default test command to capture the logs
      const child = execa("forge", ["test", "-vvv", "--isolate"], {
        stdio: ["inherit", "pipe", "inherit"],
        env: { GAS_REPORTER_ENABLED: "true" },
      });
      logs = (await child).stdout;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error.stdout ?? error);
    console.log(chalk.red("\n-----------\nError while running the gas report (see above)"));
    throw error;
  }

  // Extract the gas reports from the logs
  const lines = logs.split("\n").map(stripAnsi);
  const gasReportPattern = /^\s*GAS REPORT: (\d+) (.*)$/;
  const testFunctionPattern = /^\[(?:PASS|FAIL).*\] (\w+)\(\)/;
  // Matches "Running" for forge versions before 2024-02-15
  // And "Ran" for forge versions after 2024-02-15
  const testFilePattern = /^(?:Running|Ran) \d+ tests? for (.*:.*)$/;

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
