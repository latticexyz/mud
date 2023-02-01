import type { Arguments, CommandBuilder } from "yargs";
import { readFileSync, writeFileSync, rmSync } from "fs";
import { execa } from "execa";
import chalk from "chalk";
import { table, getBorderCharacters } from "table";

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
  source: string;
  name: string;
  functionCall: string;
  gasUsed: number;
  prevGasUsed?: number;
};

type GasReport = GasReportEntry[];

export const command = "gas-report";
export const desc = "Create a gas report";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    path: { type: "array", default: ["Gas.t.sol"], desc: "File containing the gas tests" },
    save: { type: "string", desc: "Save the gas report to a file" },
    compare: { type: "string", desc: "Compare to an existing gas report" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const { path, save } = args;
  let { compare } = args;
  let gasReport: GasReport = [];

  // Iterate through all files provided in the path
  for (const file of path) {
    gasReport = gasReport.concat(await runGasReport(file));
  }

  // If this gas report should be compared to an existing one, load the existing one
  const compareGasReport: GasReport = [];
  if (compare) {
    try {
      const compareFileContents = readFileSync(compare, "utf8");
      // Create a regex to extract the name, function call and gas used
      const compareGasReportRegex = new RegExp(/\((.*)\) \| (.*) \[(.*)\]: (.*)/g);
      // Loop through the matches and add the resuls to the compareGasReport
      let compareGasReportMatch;
      while ((compareGasReportMatch = compareGasReportRegex.exec(compareFileContents)) !== null) {
        const source = compareGasReportMatch[1];
        const name = compareGasReportMatch[2];
        const functionCall = compareGasReportMatch[3];
        const gasUsed = compareGasReportMatch[4];

        compareGasReport.push({ source, name, functionCall, gasUsed: parseInt(gasUsed) });
      }
    } catch {
      console.log(chalk.red(`Gas report to compare not found: ${compare}`));
      compare = undefined;
    }
  }

  // Merge the previous gas report with the new one
  gasReport = gasReport.map((entry) => {
    const prevEntry = compareGasReport.find((e) => e.name === entry.name && e.functionCall === entry.functionCall);
    return { ...entry, prevGasUsed: prevEntry?.gasUsed };
  });

  // Print gas report
  printGasReport(gasReport, compare);

  // Save gas report to file if requested
  if (save) saveGasReport(gasReport, save);

  process.exit(0);
};

async function runGasReport(path: string): Promise<GasReport> {
  if (!path.endsWith(".t.sol")) {
    console.log("Skipping gas report for", chalk.bold(path), "(not a test file)");
    return [];
  }
  console.log("Running gas report for", chalk.bold(path));
  const gasReport: GasReport = [];

  // Parse the given test file, and add gas reporting wherever requested by a `// !gasreport` comment
  const fileContents = readFileSync(path, "utf8");
  let newFile = fileContents;

  // Use a regex to find first line of each function
  const functionRegex = new RegExp(/function (.*){/g);
  // Insert a line to declare the _gasreport variable at the start of each function
  let functionMatch;
  while ((functionMatch = functionRegex.exec(fileContents)) !== null) {
    const functionSignature = functionMatch[0];
    newFile = newFile.replace(functionSignature, `${functionSignature}\nuint256 _gasreport;`);
  }

  // A gasreport comment has a name (written after the comment) and a function call (written on the next line)
  // Create a regex to extract both the name and the function call
  const regex = new RegExp(/\/\/ !gasreport (.*)\n(.*)/g);

  // Apply the regex and loop through the matches,
  // and create a new file with the gasreport comments replaced by the gas report
  let match;
  let i = 0;
  while ((match = regex.exec(fileContents)) !== null) {
    const name = match[1];
    const functionCall = match[2].trim();

    newFile = newFile.replace(
      match[0],
      `
_gasreport = gasleft();
${functionCall}
_gasreport = _gasreport - gasleft();
console.log("GAS REPORT: ${name} [${functionCall}]:", _gasreport);`
    );

    i++;
  }

  // Remove all occurrences of `pure` with `view`
  newFile = newFile.replace(/pure/g, "view");

  // Write the new file to disk (temporarily)
  // Create the temp file by replacing the previous file name with MudGasReport
  const tempFileName = path.replace(/\.t\.sol$/, "MudGasReport.t.sol");
  writeFileSync(tempFileName, newFile);

  // Run the generated file using forge
  const child = execa("forge", ["test", "--match-path", tempFileName, "-vvv"], {
    stdio: ["inherit", "pipe", "inherit"],
  });

  // Extrect the logs from the child process
  let logs = "";
  try {
    logs = (await child).stdout;
    rmSync(tempFileName);
  } catch (e: any) {
    console.log(e.stdout ?? e);
    console.log(chalk.red("\n-----------\nError while running the gas report (see above)"));
    rmSync(tempFileName);
    process.exit();
  }

  // Extract the gas reports from the logs

  // Create a regex to find all lines starting with `GAS REPORT:` and extract the name, function call and gas used
  const gasReportRegex = new RegExp(/GAS REPORT: (.*) \[(.*)\]: (.*)/g);

  // Loop through the matches and print the gas report
  let gasReportMatch;
  while ((gasReportMatch = gasReportRegex.exec(logs)) !== null) {
    const name = gasReportMatch[1];
    const functionCall = gasReportMatch[2].replace(";", "");
    const gasUsed = gasReportMatch[3];

    gasReport.push({ source: path, name, functionCall, gasUsed: parseInt(gasUsed) });
  }

  return gasReport;
}

function printGasReport(gasReport: GasReport, compare?: string) {
  if (compare) console.log(chalk.bold(`Gas report compared to ${compare}`));

  const headers = [
    chalk.bold("Source"),
    chalk.bold("Name"),
    chalk.bold("Function call"),
    chalk.bold("Gas used"),
    ...(compare ? [chalk.bold("Prev gas used"), chalk.bold("Difference")] : []),
  ];

  const values = gasReport.map((entry) => {
    const diff = entry.prevGasUsed ? entry.gasUsed - entry.prevGasUsed : 0;
    const diffEntry = diff > 0 ? chalk.red(`+${diff}`) : diff < 0 ? chalk.green(`${diff}`) : diff;
    const compareColumns = compare ? [entry.prevGasUsed ?? "n/a", diffEntry] : [];
    const gasUsedEntry = diff > 0 ? chalk.red(entry.gasUsed) : diff < 0 ? chalk.green(entry.gasUsed) : entry.gasUsed;
    return [entry.source, entry.name, entry.functionCall, gasUsedEntry, ...compareColumns];
  });

  const rows = [headers, ...values];

  console.log(table(rows, { border: getBorderCharacters("norc") }));
}

function saveGasReport(gasReport: GasReport, path: string) {
  console.log(chalk.bold(`Saving gas report to ${path}`));
  const serializedGasReport = gasReport
    .map((entry) => `(${entry.source}) | ${entry.name} [${entry.functionCall}]: ${entry.gasUsed}`)
    .join("\n");

  writeFileSync(path, serializedGasReport);
}
