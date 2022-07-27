import { Arguments, CommandBuilder } from "yargs";
import { execLog, extractIdFromFile, keccak256 } from "../utils";
import { readFileSync } from "fs";
import { Contract } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";

type Options = {
  config?: string;
  world: string;
  tx: string;
  rpc?: string;
  debug?: boolean;
};

export const command = "trace";
export const desc = "Display the trace of a transaction";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    config: { type: "string", description: "path to mud deploy config (deploy.json)" },
    world: { type: "string", required: true, description: "world contract address" },
    tx: { type: "string", required: true, description: "tx hash to replay" },
    rpc: { type: "string", description: "json rpc endpoint, defaults to http://localhost:8545" },
    debug: { type: "boolean", description: "open debugger" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { config, world, rpc, tx, debug } = argv;
  const wd = process.cwd();
  const deployData = config && JSON.parse(readFileSync(config, { encoding: "utf8" }));
  const labels = [];

  const provider = new JsonRpcProvider(rpc || "http://localhost:8545");
  const World = new Contract(world, WorldAbi, provider);

  if (deployData) {
    // Create component labels
    const componentPromises = deployData.components.map(async (component: string) => {
      const path = `${wd}/src/components/${component}.sol`;
      const id = extractIdFromFile(path);
      if (!id) return;
      const address = await World.getComponent(keccak256(id));
      return [component, address];
    });
    // Create system labels
    const systemPromises = deployData.systems.map(async (system: { name: string }) => {
      const path = `${wd}/src/systems/${system.name}.sol`;
      const id = extractIdFromFile(path);
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
    `${tx}`,
  ]);

  process.exit(0);
};
