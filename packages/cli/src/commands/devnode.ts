import { rmSync } from "fs";
import { homedir } from "os";
import path from "path";
import type { CommandModule } from "yargs";
import { execa } from "execa";

type Options = {
  blocktime: number;
};

const commandModule: CommandModule<Options, Options> = {
  command: "devnode",

  describe: "Start a local Ethereum node for development",

  builder(yargs) {
    return yargs.options({
      blocktime: { type: "number", default: 1, decs: "Interval in which new blocks are produced" },
    });
  },

  async handler({ blocktime }) {
    console.log("Clearing devnode history");
    const userHomeDir = homedir();
    rmSync(path.join(userHomeDir, ".foundry", "anvil", "tmp"), { recursive: true, force: true });

    const anvilArgs = ["-b", String(blocktime), "--block-base-fee-per-gas", "0"];
    console.log(`Running: anvil ${anvilArgs.join(" ")}`);
    const child = execa("anvil", anvilArgs, {
      stdio: ["inherit", "inherit", "inherit"],
    });

    process.on("SIGINT", () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      process.exit();
    });
    await child;
  },
};

export default commandModule;
