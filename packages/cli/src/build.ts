import path from "node:path";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { World as WorldConfig } from "@latticexyz/world";
import { forge, getRemappings } from "@latticexyz/common/foundry";
import { getExistingContracts } from "./utils/getExistingContracts";
import { execa } from "execa";

type BuildOptions = {
  foundryProfile?: string;
  srcDir: string;
  /**
   * MUD project root directory where all other relative paths are resolved from.
   *
   * Defaults to the directory of the nearest `mud.config.ts`, looking in `process.cwd()` and moving up the directory tree.
   */
  rootDir: string;
  config: WorldConfig;
};

export async function build({
  rootDir,
  config,
  srcDir,
  foundryProfile = process.env.FOUNDRY_PROFILE,
}: BuildOptions): Promise<void> {
  const outPath = path.join(srcDir, config.codegen.outputDirectory);
  const remappings = await getRemappings(foundryProfile);

  await Promise.all([
    tablegen({ rootDir, config, remappings }),
    worldgen(config, getExistingContracts(srcDir), outPath),
  ]);

  await forge(["build"], { profile: foundryProfile });
  await execa("mud", ["abi-ts"], { stdio: "inherit" });
}
