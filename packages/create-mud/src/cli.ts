#!/usr/bin/env node

import { create } from "create-create-app";
import { resolve } from "path";
import packageJson from "../package.json";

const templateRoot = resolve(__dirname, "..", "dist", "templates");

// See https://github.com/uetchy/create-create-app/blob/master/README.md for other options.

create("create-mud", {
  templateRoot,
  defaultTemplate: "minimal",
  // templates use pnpm workspaces, so default to that for now
  // not sure if it's worth trying to support multiple kinds of package managers for monorepos, given the tooling is so different
  defaultPackageManager: "pnpm",
  promptForDescription: false,
  promptForAuthor: false,
  promptForEmail: false,
  promptForLicense: false,
  promptForTemplate: true,
  caveat: ({ answers, packageManager }) =>
    `Done! Play in the MUD with \`cd ${answers.name}\` and \`${packageManager} run dev\``,
  extra: {
    "mud-version": {
      type: "input",
      describe: "The version of MUD packages to use, defaults to latest",
      default: packageJson.version,
    },
  },
});
