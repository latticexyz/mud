import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { World as WorldConfig } from "@latticexyz/world";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { forge, getForgeConfig, getRemappings } from "@latticexyz/common/foundry";
import { getExistingContracts } from "./utils/getExistingContracts";
import { debug as parentDebug } from "./debug";
import { execa } from "execa";

const debug = parentDebug.extend("runDeploy");

type BuildOptions = {
  foundryProfile?: string;
  srcDir: string;
  config: WorldConfig;
};

export async function build({
  config: configV2,
  srcDir,
  foundryProfile = process.env.FOUNDRY_PROFILE,
}: BuildOptions): Promise<void> {
  const config = worldToV1(configV2);
  const outPath = path.join(srcDir, config.codegenDirectory);
  const remappings = await getRemappings(foundryProfile);
  await Promise.all([
    tablegen(configV2, outPath, remappings),
    worldgen(configV2, getExistingContracts(srcDir), outPath),
  ]);

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
