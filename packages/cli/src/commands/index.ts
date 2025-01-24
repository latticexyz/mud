import { CommandModule } from "yargs";

import { command as gasReport } from "@latticexyz/gas-report/internal";
import { command as abiTs } from "@latticexyz/abi-ts/internal";

import build from "./build";
import devnode from "./devnode";
import hello from "./hello";
import tablegen from "./tablegen";
import deploy from "./deploy";
import worldgen from "./worldgen";
import setVersion from "./set-version";
import test from "./test";
import trace from "./trace";
import devContracts from "./dev-contracts";
import verify from "./verify";
import pull from "./pull";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  build,
  deploy,
  devnode,
  gasReport,
  hello,
  tablegen,
  worldgen,
  setVersion,
  test,
  trace,
  devContracts,
  abiTs,
  verify,
  pull,
];
