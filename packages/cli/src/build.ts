import { tablegen } from "@latticexyz/store/codegen";
import { buildSystemsManifest, worldgen } from "@latticexyz/world/node";
import { World as WorldConfig } from "@latticexyz/world";
import { execa } from "execa";
import { printCommand } from "./utils/printCommand";

type BuildOptions = {
  foundryProfile?: string;
  /**
   * MUD project root directory where all other relative paths are resolved from.
   *
   * Defaults to the directory of the nearest `mud.config.ts`, looking in `process.cwd()` and moving up the directory tree.
   */
  rootDir: string;
  config: WorldConfig;
};

export async function build({ rootDir, config, foundryProfile }: BuildOptions): Promise<void> {
  await tablegen({ rootDir, config });
  await worldgen({ rootDir, config });
  await printCommand(
    execa("forge", ["build"], {
      stdio: "inherit",
      env: { FOUNDRY_PROFILE: foundryProfile ?? process.env.FOUNDRY_PROFILE },
    }),
  );
  await buildSystemsManifest({ rootDir, config });
  await printCommand(execa("mud", ["abi-ts"], { stdio: "inherit" }));
}
