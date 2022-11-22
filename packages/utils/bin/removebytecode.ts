#! /usr/bin/env ts-node

import { parse } from "ts-command-line-args";

import { removeBytecode, IRemoveBytecodeArguments } from "../src";

const args = parse<IRemoveBytecodeArguments>({
  dir: String,
});

removeBytecode(args);
