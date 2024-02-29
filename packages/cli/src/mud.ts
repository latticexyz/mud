#!/usr/bin/env node

// Load .env file into process.env
import * as dotenv from "dotenv";
dotenv.config();

async function run() {
  // Import everything else async so they can pick up env vars in .env
  const { default: yargs } = await import("yargs");
  const { default: chalk } = await import("chalk");
  const { hideBin } = await import("yargs/helpers");
  const { logError } = await import("./utils/errors");
  const { commands } = await import("./commands");

  yargs(hideBin(process.argv))
    // Explicit name to display in help (by default it's the entry file, which may not be "mud" for e.g. ts-node)
    .scriptName("mud")
    // Use the commands directory to scaffold
    // command array overload isn't typed, see https://github.com/yargs/yargs/blob/main/docs/advanced.md#esm-hierarchy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .command(commands as any)
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
      console.log("");
      // Even though `.fail` type says we should get an `Error`, this can sometimes be undefined
      if (err != null) {
        logError(err);
        console.log("");
      }

      process.exit(1);
    })
    // Useful aliases.
    .alias({ h: "help" }).argv;
}

run();
