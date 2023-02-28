#!/usr/bin/env node

import { create } from "create-create-app";
import { resolve } from "path";
import packageJson from "../package.json";

const templateRoot = resolve(__dirname, "..", "templates");

// See https://github.com/uetchy/create-create-app/blob/master/README.md for other options.

create("create-mud", {
  templateRoot,
  defaultTemplate: "minimal",
  promptForDescription: false,
  promptForAuthor: false,
  promptForEmail: false,
  promptForLicense: false,
  promptForTemplate: true,
  caveat: ({ answers }) => `Done! Play in the MUD with \`cd ${answers.name}\` and \`yarn dev\``,
  extra: {
    "mud-version": {
      type: "input",
      describe: "The version of MUD packages to use, defaults to latest",
      default: packageJson.version,
    },
  },
});
