#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import gasReport from ".";

// Load .env file into process.env
import * as dotenv from "dotenv";
import chalk from "chalk";
dotenv.config();

// $0 makes this a default command (as opposed to a sub-command),
// which replaces `gas-report gas-report` with just `gas-report`
gasReport.command = "$0";

yargs(hideBin(process.argv))
  .scriptName("gas-report")
  // Use the commands directory to scaffold
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- command array overload isn't typed, see https://github.com/yargs/yargs/blob/main/docs/advanced.md#esm-hierarchy
  .command(gasReport as any)
  // Enable strict mode.
  .strict()
  // Custom error handler
  .fail((msg, err) => {
    console.error(chalk.red(msg));
    if (msg.includes("Missing required argument")) {
      console.log(
        chalk.yellow(`Run 'pnpm mud ${process.argv[2]} --help' for a list of available and required arguments.`)
      );
    }

    process.exit(1);
  })
  // Useful aliases.
  .alias({ h: "help" }).argv;
