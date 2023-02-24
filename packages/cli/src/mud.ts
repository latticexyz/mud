#!/usr/bin/env ts-node-esm

// -S ts-node-esm --no-warnings
// TODO env -S flag may not be well supported, gather feedback

import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./commands/index.js";
import { MUDError } from "./utils/errors.js";

yargs(hideBin(process.argv))
  // Explicit name to display in help (by default it's the entry file, which may not be "mud" for e.g. ts-node)
  .scriptName("mud")
  // Use the commands directory to scaffold
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- command array overload isn't typed, see https://github.com/yargs/yargs/blob/main/docs/advanced.md#esm-hierarchy
  .command(commands as any)
  // Enable strict mode.
  .strict()
  // Custom error handler
  .fail((msg, err) => {
    if (MUDError.isMUDError(err)) {
      console.log("");
      console.log(chalk.red(err.message));
      console.log("");
    } else {
      console.log("");
      console.log(err);
      console.log("");
    }
    process.exit(1);
  })
  // Useful aliases.
  .alias({ h: "help" }).argv;
