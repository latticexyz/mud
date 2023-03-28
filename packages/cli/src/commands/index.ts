import { CommandModule } from "yargs";

import bulkupload from "./deprecated/bulkupload.js";
import callSystem from "./deprecated/call-system.js";
import codegenLibdeploy from "./deprecated/codegen-libdeploy.js";
import deployContracts from "./deprecated/deploy-contracts.js";
import systemTypes from "./deprecated/system-types.js";
import test from "./deprecated/test.js";
import trace from "./deprecated/trace.js";
import types from "./deprecated/types.js";

import devnode from "./devnode.js";
import faucet from "./faucet.js";
import gasReport from "./gas-report.js";
import hello from "./hello.js";
import tablegen from "./tablegen.js";
import deployV2 from "./deploy-v2.js";
import worldgen from "./worldgen.js";
import setVersion from "./set-version.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  bulkupload,
  callSystem,
  codegenLibdeploy,
  deployContracts,
  deployV2,
  devnode,
  faucet,
  gasReport,
  hello,
  systemTypes,
  tablegen,
  test,
  trace,
  types,
  worldgen,
  setVersion,
];
