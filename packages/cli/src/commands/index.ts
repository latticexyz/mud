import { CommandModule } from "yargs";

import devnode from "./devnode";
import faucet from "./faucet";
import gasReport from "./gas-report";
import hello from "./hello";
import tablegen from "./tablegen";
import tsgen from "./tsgen";
import deployV2 from "./deploy";
import worldgen from "./worldgen";
import setVersion from "./set-version";
import testV2 from "./test";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  deployV2,
  devnode,
  faucet,
  gasReport,
  hello,
  tablegen,
  tsgen,
  worldgen,
  setVersion,
  testV2,
];
