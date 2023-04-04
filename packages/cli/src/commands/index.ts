import { CommandModule } from "yargs";

import devnode from "./devnode.js";
import faucet from "./faucet.js";
import gasReport from "./gas-report.js";
import hello from "./hello.js";
import tablegen from "./tablegen.js";
import tsgen from "./tsgen.js";
import deployV2 from "./deploy-v2.js";
import worldgen from "./worldgen.js";
import setVersion from "./set-version.js";
import testV2 from "./test-v2.js";

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
