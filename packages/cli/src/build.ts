import path from "node:path";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { World as WorldConfig } from "@latticexyz/world";
import { forge, getRemappings } from "@latticexyz/common/foundry";
import { getExistingDatas } from "./utils/getExistingDatas";
import { execa } from "execa";

type BuildOptions = {
  foundryProfile?: string;
  srcDir: string;
  outDir: string;
  /**
   * Path to `mud.config.ts`. We use this as the "project root" to resolve other relative paths.
   *
   * Defaults to finding the nearest `mud.config.ts`, looking in `process.cwd()` and moving up the directory tree.
   */
  configPath: string;
  config: WorldConfig;
};

export async function build({
  configPath,
  config,
  srcDir,
  outDir,
  foundryProfile = process.env.FOUNDRY_PROFILE,
}: BuildOptions): Promise<void> {
  const outPath = path.join(srcDir, config.codegen.outputDirectory);
  const remappings = await getRemappings(foundryProfile);

  await Promise.all([
    tablegen({ configPath, config, remappings }),
    worldgen(config, getExistingDatas(outDir), outPath),
  ]);

  await forge(["build"], { profile: foundryProfile });
  await execa("mud", ["abi-ts"], { stdio: "inherit" });
}
