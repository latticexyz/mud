import { readFileSync, writeFileSync } from "fs";
import ejs from "ejs";

const contractsDir = __dirname + "/../../src/contracts";

export async function generateLibDeploy(configPath: string, out: string, systems?: string | string[]) {
  // Parse config
  const config = JSON.parse(readFileSync(configPath, { encoding: "utf8" }));

  // Filter systems
  if (systems) {
    const systemsArray = Array.isArray(systems) ? systems : [systems];
    config.systems = config.systems.filter((system: { name: string }) => systemsArray.includes(system.name));
  }

  console.log(`Deploy config: \n`, JSON.stringify(config, null, 2));

  // Generate LibDeploy
  console.log("Generating deployment script");
  const LibDeploy = await ejs.renderFile(contractsDir + "/LibDeploy.ejs", config, { async: true });
  const path = out + "/LibDeploy.sol";
  writeFileSync(path, LibDeploy);

  return path;
}
