import { createRequire } from "node:module";
import { findUp } from "find-up";
import { GetContractArtifactResult, getContractArtifact } from "./getContractArtifact";

export type ImportContractArtifactOptions = {
  /**
   * Path to `package.json` where `artifactPath`s are resolved relative to.
   *
   * Defaults to nearest `package.json` relative to `process.cwd()`.
   */
  packageJsonPath?: string;
  /**
   * Import path to contract's forge/solc JSON artifact with the contract's compiled bytecode.
   *
   * This path is resolved using node's module resolution relative to `configPath`, so this supports both
   * relative file paths (`../path/to/MyModule.json`) as well as JS import paths (`@latticexyz/world-contracts/out/CallWithSignatureModule.sol/CallWithSignatureModule.json`).
   */
  artifactPath: string;
};

export async function importContractArtifact({
  packageJsonPath,
  artifactPath,
}: ImportContractArtifactOptions): Promise<GetContractArtifactResult> {
  let artfactJson;
  try {
    const requirePath = packageJsonPath ?? (await findUp("package.json", { cwd: process.cwd() }));
    if (!requirePath) throw new Error("Could not find package.json to import relative to.");

    const require = createRequire(requirePath);
    artfactJson = require(artifactPath);
  } catch (error) {
    console.error();
    console.error("Could not import contract artifact at", artifactPath);
    console.error();
    throw error;
  }

  return getContractArtifact(artfactJson);
}
