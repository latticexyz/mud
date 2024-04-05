import path from "node:path";
import { tablegen } from "@latticexyz/store/codegen";
import { worldgen } from "@latticexyz/world/node";
import { World as WorldConfig } from "@latticexyz/world";
import { worldToV1 } from "@latticexyz/world/config/v2";
import { forge, getRemappings } from "@latticexyz/common/foundry";
import { getExistingContracts } from "./utils/getExistingContracts";
import { execa } from "execa";

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

  await forge(["build"], { profile: foundryProfile });
  await execa("mud", ["abi-ts"], { stdio: "inherit" });
}
