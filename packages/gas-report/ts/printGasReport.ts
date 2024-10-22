import chalk from "chalk";
import { table, getBorderCharacters } from "table";
import { GasReport } from "./common";

export function printGasReport(gasReport: GasReport, compare?: string) {
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
