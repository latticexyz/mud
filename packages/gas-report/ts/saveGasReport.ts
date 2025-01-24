import { writeFileSync } from "fs";
import chalk from "chalk";
import { GasReport } from "./common";

export function saveGasReport(gasReport: GasReport, path: string) {
  console.log(chalk.bold(`Saving gas report to ${path}`));
  writeFileSync(path, `${JSON.stringify(gasReport, null, 2)}\n`);
}
