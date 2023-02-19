#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { commands } from "./commands/index.js";

yargs(hideBin(process.argv))
  // Explicit name to display in help (by default it's the entry file, which may not be "mud" for e.g. ts-node)
  .scriptName("mud")
  // Use the commands directory to scaffold
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- command array overload isn't typed, see https://github.com/yargs/yargs/blob/main/docs/advanced.md#esm-hierarchy
  .command(commands as any)
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: "help" }).argv;
