import { CommandModule } from "yargs";

import bulkupload from "./bulkupload";
import callSystem from "./call-system";
import codegenLibdeploy from "./codegen-libdeploy";
import deployContracts from "./deploy-contracts";
import systemTypes from "./system-types";
import test from "./test";
import trace from "./trace";
import types from "./types";

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
