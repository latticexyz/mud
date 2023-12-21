import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { StoreConfig } from "@latticexyz/store";
import { WorldConfig } from "@latticexyz/world";
import { forge, getForgeConfig, getRemappings } from "@latticexyz/common/foundry";
import { getExistingContracts } from "./utils/getExistingContracts";
import { debug as parentDebug } from "./debug";
import { execa } from "execa";

const debug = parentDebug.extend("runDeploy");

type BuildOptions = {
  foundryProfile?: string;
  srcDir: string;
  config: StoreConfig & WorldConfig;
};

export async function build({
  config,
  srcDir,
  foundryProfile = process.env.FOUNDRY_PROFILE,
}: BuildOptions): Promise<void> {
  const outPath = path.join(srcDir, config.codegenDirectory);
  const remappings = await getRemappings(foundryProfile);
  await Promise.all([tablegen(config, outPath, remappings), worldgen(config, getExistingContracts(srcDir), outPath)]);

  // TODO remove when https://github.com/foundry-rs/foundry/issues/6241 is resolved
  const forgeConfig = await getForgeConfig(foundryProfile);
  if (forgeConfig.cache) {
    const cacheFilePath = path.join(forgeConfig.cache_path, "solidity-files-cache.json");
    if (existsSync(cacheFilePath)) {
      debug("Unsetting cached content hash of IWorld.sol to force it to regenerate");
      const solidityFilesCache = JSON.parse(readFileSync(cacheFilePath, "utf8"));
      const worldInterfacePath = path.join(outPath, "world", "IWorld.sol");
      solidityFilesCache["files"][worldInterfacePath]["contentHash"] = "";
      writeFileSync(cacheFilePath, JSON.stringify(solidityFilesCache, null, 2));
    }
  }

  await forge(["build"], { profile: foundryProfile });
  await execa("mud", ["abi-ts"], { stdio: "inherit" });
}
