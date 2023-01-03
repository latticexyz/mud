import { readFile, writeFile, mkdir } from "fs/promises";
import ejs from "ejs";
import path from "path";
import { getForgeConfig } from "./config";
import { glob } from "glob";

const contractsDir = path.join(__dirname, "../../src/contracts");

const stubLibDeploy = readFile(path.join(contractsDir, "LibDeployStub.sol"));

/**
 * Generate LibDeploy.sol from deploy.json
 * @param configPath path to deploy.json
 * @param out output directory for LibDeploy.sol
 * @param systems optional, only generate deploy code for the given systems
 * @returns path to generated LibDeploy.sol
 */
export async function generateLibDeploy(configPath: string, out: string, systems?: string | string[]) {
  // Parse config
  const config = JSON.parse(await readFile(configPath, { encoding: "utf8" }));

  // Initializers are optional
  config.initializers ??= [];

  // Get file paths for all the names of components, systems and initializers
  // (allNames filter just helps avoid spam in logs, unused mappings wouldn't break anything)
  const allNames = config.components
    .concat(config.initializers)
    .concat(config.systems.map(({ name }: { name: string }) => name));
  config.nameToPath = await getNameToPath(out, allNames);

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
  await mkdir(out, { recursive: true });
  await writeFile(libDeployPath, LibDeploy);

  return libDeployPath;
}

export async function resetLibDeploy(out: string) {
  await writeFile(path.join(out, "LibDeploy.sol"), await stubLibDeploy);
}

/**
 * Map ecs names to their file paths (relative to `out`)
 */
async function getNameToPath(out: string, names: string[]) {
  // Use forge's config for src dir
  const forgeConfig = await getForgeConfig();
  const srcDir = forgeConfig.src;

  // Recursively get all solidity files
  const ecsFiles = glob.sync(path.join(srcDir, "**/*.sol"));
  // And map basenames (without extension) to their paths
  const nameToPath: { [key: string]: string } = {};
  for (const file of ecsFiles) {
    const name = path.basename(file, ".sol");
    // skip if `name` isn't in `names`
    if (names.includes(name)) {
      // "./" must be added because path stripts it,
      // but solidity expects it unless there's "../" ("./../" is fine)
      nameToPath[name] = "./" + path.relative(out, file);
    }
  }
  return nameToPath;
}
