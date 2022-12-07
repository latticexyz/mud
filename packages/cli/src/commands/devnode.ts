import { rmSync } from "fs";
import { homedir } from "os";
import path from "path";
import type { Arguments, CommandBuilder } from "yargs";
import { execLog } from "../utils";

type Options = {
  blocktime: number;
};

export const command = "devnode";
export const desc = "Start a local Ethereum node for development";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    blocktime: { type: "number", default: 1, decs: "Interval in which new blocks are produced" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { blocktime } = argv;
  console.log("Clearing devnode history");
  const userHomeDir = homedir();
  rmSync(path.join(userHomeDir, ".foundry", "anvil", "tmp"), { recursive: true, force: true });
  const { child } = await execLog("anvil", ["-b", String(blocktime), "--block-base-fee-per-gas", "0"]);

  process.on("SIGINT", () => {
    console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
    child.kill();
    process.exit();
  });
};
