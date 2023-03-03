#!/usr/bin/env node

// This script runs a command in each workspace package like `yarn workspaces run` does,
// but it continues running even if one of the commands fails.
// (see https://github.com/yarnpkg/yarn/issues/6994)

import shell from "shelljs";
import chalk from "chalk";

const output = shell.exec("yarn workspaces info --json", { silent: true }).stdout;
const packages = JSON.parse(output);

const args = process.argv.slice(2);
const argsString = args.join(" ");

var exitCode = 0;

for (let [packageName, { location }] of Object.entries(packages)) {
  console.log(chalk.bgYellow(`\n=== Running script "${argsString}" in "${packageName}"`));
  const { code } = shell.exec(`yarn --cwd ${location} --color=always run ${args.join(" ")}`);
  if (code > 0) exitCode = 1;
}

shell.exit(exitCode);
