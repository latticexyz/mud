import { CommandModule } from "yargs";

import gasReport from "@latticexyz/gas-report";
import abiTs from "@latticexyz/abi-ts";

import devnode from "./devnode";
import faucet from "./faucet";
import hello from "./hello";
import tablegen from "./tablegen";
import deploy from "./deploy";
import worldgen from "./worldgen";
import setVersion from "./set-version";
import test from "./test";
import trace from "./trace";
import devContracts from "./dev-contracts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  deploy,
  devnode,
  faucet,
  gasReport as CommandModule,
  hello,
  tablegen,
  worldgen,
  setVersion,
  test,
  trace,
  devContracts,
  abiTs,
];
