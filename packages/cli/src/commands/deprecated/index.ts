import { CommandModule } from "yargs";

import bulkupload from "./bulkupload.js";
import callSystem from "./call-system.js";
import codegenLibdeploy from "./codegen-libdeploy.js";
import deployContracts from "./deploy-contracts.js";
import systemTypes from "./system-types.js";
import test from "./test.js";
import trace from "./trace.js";
import types from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  bulkupload,
  callSystem,
  deployContracts,
  codegenLibdeploy,
  systemTypes,
  test,
  trace,
  types,
];
