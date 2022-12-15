import { readFile, writeFile } from "fs/promises";
import ejs from "ejs";
import path from "path";

const contractsDir = path.join(__dirname, "../../src/contracts");

const stubLibDeploy = readFile(path.join(contractsDir, "LibDeploy.sol"));

export async function generateLibDeploy(configPath: string, out: string, systems?: string | string[]) {
  // Parse config
  const config = JSON.parse(await readFile(configPath, { encoding: "utf8" }));

  // Filter systems
  if (systems) {
    const systemsArray = Array.isArray(systems) ? systems : [systems];
    config.systems = config.systems.filter((system: { name: string }) => systemsArray.includes(system.name));
  }

  console.log(`Deploy config: \n`, JSON.stringify(config, null, 2));

  // Generate LibDeploy
  console.log("Generating deployment script");
  const LibDeploy = await ejs.renderFile(path.join(contractsDir, "LibDeploy.ejs"), config, { async: true });
  const libDeployPath = path.join(out, "LibDeploy.sol");
  await writeFile(libDeployPath, LibDeploy);

  return libDeployPath;
}

export async function resetLibDeploy(out: string) {
  await writeFile(path.join(out, "LibDeploy.sol"), await stubLibDeploy);
}
