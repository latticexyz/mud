#!/usr/bin/env ts-node-esm

// #!/usr/bin/env -S NODE_NO_WARNINGS=1 ts-node-esm

// `-S NODE_NO_WARNINGS=1` suppresses an experimental warning about esm json imports.
// TODO It could be removed if `-S` causes issues for users, although it should be well-supported now.

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
