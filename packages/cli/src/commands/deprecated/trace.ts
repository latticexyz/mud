import type { CommandModule } from "yargs";
import { execLog, extractIdFromFile, keccak256 } from "../../utils/deprecated/index.js";
import { readFileSync } from "fs";
import { Contract } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import WorldAbi from "@latticexyz/solecs/abi/World.sol/World.json" assert { type: "json" };
import { getSrcDirectory } from "@latticexyz/common/foundry";
import path from "path";
import { componentsDir, systemsDir } from "../../utils/deprecated/constants.js";

type Options = {
  config?: string;
  world: string;
  tx: string;
  rpc?: string;
  debug?: boolean;
};

const commandModule: CommandModule<Options, Options> = {
  command: "trace",

  describe: "Display the trace of a transaction",

  builder(yargs) {
    return yargs.options({
      config: { type: "string", description: "path to mud deploy config (deploy.json)" },
      world: { type: "string", required: true, description: "world contract address" },
      tx: { type: "string", required: true, description: "tx hash to replay" },
      rpc: { type: "string", description: "json rpc endpoint, defaults to http://localhost:8545" },
      debug: { type: "boolean", description: "open debugger" },
    });
  },

  async handler({ config, world, rpc, tx, debug }) {
    const wd = process.cwd();
    const deployData = config && JSON.parse(readFileSync(config, { encoding: "utf8" }));
    const labels = [];

    const rpcUrl = rpc || "http://localhost:8545";
    const provider = new JsonRpcProvider(rpcUrl);
    const World = new Contract(world, WorldAbi.abi, provider);

    if (deployData) {
      const srcDir = await getSrcDirectory();

      // Create component labels
      const componentPromises = deployData.components.map(async (component: string) => {
        const filePath = path.join(wd, srcDir, componentsDir, `${component}.sol`);
        const id = extractIdFromFile(filePath);
        if (!id) return;
        const address = await World.getComponent(keccak256(id));
        return [component, address];
      });
      // Create system labels
      const systemPromises = deployData.systems.map(async (system: { name: string }) => {
        const filePath = path.join(wd, srcDir, systemsDir, `${system.name}.sol`);
        const id = extractIdFromFile(filePath);
        if (!id) return;
        const address = await World.getSystemAddress(keccak256(id));
        return [system.name, address];
      });

      const components = await Promise.all(componentPromises);
      const systems = await Promise.all(systemPromises);

      labels.push(...components, ...systems);
    }
    await execLog("cast", [
      "run",
      ...labels.map((label) => ["--label", `${label[1]}:${label[0]}`]).flat(),
      ...(debug ? ["--debug"] : []),
      `--rpc-url`,
      `${rpcUrl}`,
      `${tx}`,
    ]);

    process.exit(0);
  },
};

export default commandModule;
