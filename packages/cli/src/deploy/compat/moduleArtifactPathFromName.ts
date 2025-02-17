import { Module } from "@latticexyz/world/internal";
import path from "node:path";

// Please don't add to this list!
//
// These are kept for backwards compatibility and assumes the downstream project has this module installed as a dependency.
const knownModuleArtifacts = {
  KeysWithValueModule: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
  KeysInTableModule: "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json",
  UniqueEntityModule: "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json",
};

/** @internal For use with `config.modules.map(...)` */
export function moduleArtifactPathFromName(
  forgeOutDir: string,
): (mod: Module) => Module & { readonly artifactPath: string } {
  return (mod) => {
    if (mod.artifactPath) return mod as never;
    if (!mod.name) throw new Error("No `artifactPath` provided for module.");

    const artifactPath =
      knownModuleArtifacts[mod.name as keyof typeof knownModuleArtifacts] ??
      path.join(forgeOutDir, `${mod.name}.sol`, `${mod.name}.json`);

    console.warn(
      [
        "",
        `⚠️ Your \`mud.config.ts\` is using a module with a \`name\`, but this option is deprecated.`,
        "",
        "To resolve this, you can replace this:",
        "",
        `  name: ${JSON.stringify(mod.name)}`,
        "",
        "with this:",
        "",
        `  artifactPath: ${JSON.stringify(artifactPath)}`,
        "",
      ].join("\n"),
    );

    return { ...mod, artifactPath };
  };
}
