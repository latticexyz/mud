import { Arguments, CommandBuilder } from "yargs";

const importExeca = eval('import("execa")') as Promise<typeof import("execa")>;

type Options = {
  statePath: string;
  worldAddress: string;
  rpc: string;
};

export const command = "bulkupload";
export const desc = "Uploads the provided ECS state to the provided World";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    statePath: { type: "string", demandOption: true, desc: "Path to the ECS state to upload" },
    worldAddress: { type: "string", demandOption: true, desc: "Contract address of the World to upload to" },
    rpc: { type: "string", demandOption: true, desc: "JSON RPC endpoint" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { execa } = await importExeca;
  const { statePath, worldAddress, rpc } = argv;
  console.log("Uploading state at ", statePath, "to", worldAddress, "on", rpc);
  const url = __dirname + "/../../src/contracts/BulkUpload.sol";
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
};
