#!/usr/bin/env node
import yargs from "yargs";
import chalk from "chalk";
import { hideBin } from "yargs/helpers";
import { logError } from "./utils/errors";
import { parseArgs } from "node:util";
import * as dotenv from "dotenv";
import { isDefined } from "@latticexyz/common/utils";

// Find `--profile` flag in args
const args = parseArgs({
  args: process.argv,
  options: {
    profile: { type: "string" },
  },
  strict: false,
  tokens: true,
});

const foundryProfile = typeof args.values.profile === "string" ? args.values.profile : process.env.FOUNDRY_PROFILE;
dotenv.config({
  path: [
    // because we're not overriding env vars, we want to load the
    // most specific one first (profile-based env)
    foundryProfile ? `.env.${foundryProfile}` : undefined,
    // then the generic one
    ".env",
  ].filter(isDefined),
});

// replace FOUNDRY_PROFILE in env so it's consistent downstream
process.env.FOUNDRY_PROFILE = foundryProfile;
// strip `--profile` flag from argv
process.argv = args.tokens
  .filter((token) => !(token.kind === "option" && token.name === "profile"))
  .flatMap((token) => {
    switch (token.kind) {
      case "positional":
        return token.value;
      case "option":
        return token.value ? [token.rawName, token.value] : [token.rawName];
      case "option-terminator":
        return "--";
      default:
        return [];
    }
  });

(async function run() {
  // Some modules (like debug) use `process.env` at import time, so we need to
  // dynamically import commands to make sure env is populated first.
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
          chalk.yellow(`Run 'pnpm mud ${process.argv[2]} --help' for a list of available and required arguments.`),
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
})();
