#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

// Using require to avoid "YError: loading a directory of commands is not supported yet for ESM" error
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

global.self = (1, eval)("this"); // https://stackoverflow.com/questions/9107240/1-evalthis-vs-evalthis-in-javascript

yargs(hideBin(process.argv))
  // Use the commands directory to scaffold.
  .commandDir("commands")
  // Enable strict mode.
  .strict()
  // Useful aliases.
  .alias({ h: "help" }).argv;

export * from "./schemaType";
