import { execa } from "execa";
import path from "path";
import type { CommandModule } from "yargs";

const contractsDirectory = new URL("../src/contracts", import.meta.url).pathname;

type Options = {
  statePath: string;
  worldAddress: string;
  rpc: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "bulkupload",

  describe: "Uploads the provided ECS state to the provided World",

  builder(yargs) {
    return yargs.options({
      statePath: { type: "string", demandOption: true, desc: "Path to the ECS state to upload" },
      worldAddress: { type: "string", demandOption: true, desc: "Contract address of the World to upload to" },
      rpc: { type: "string", demandOption: true, desc: "JSON RPC endpoint" },
    });
  },

  async handler({ statePath, worldAddress, rpc }) {
    console.log("Uploading state at ", statePath, "to", worldAddress, "on", rpc);
    const url = path.join(contractsDirectory, "BulkUpload.sol");
    console.log("Using BulkUpload script from", url);

    try {
      await execa("forge", [
        "script",
        "--sig",
        '"run(string, address)"',
        "--rpc-url",
        rpc,
        `${url}:BulkUpload`,
        statePath,
        worldAddress,
      ]);
    } catch (e) {
      console.error(e);
    }

    process.exit(0);
  },
};

export default commandModule;
