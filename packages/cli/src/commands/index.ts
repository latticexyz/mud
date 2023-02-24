import { CommandModule } from "yargs";

import bulkupload from "./bulkupload.js";
import callSystem from "./call-system.js";
import codegenLibdeploy from "./codegen-libdeploy.js";
import deployContracts from "./deploy-contracts.js";
import devnode from "./devnode.js";
import faucet from "./faucet.js";
import gasReport from "./gas-report.js";
import hello from "./hello.js";
import systemTypes from "./system-types.js";
import tablegen from "./tablegen.js";
import test from "./test.js";
import trace from "./trace.js";
import types from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  bulkupload,
  callSystem,
  codegenLibdeploy,
  deployContracts,
  devnode,
  faucet,
  gasReport,
  hello,
  systemTypes,
  tablegen,
  test,
  trace,
  types,
];
