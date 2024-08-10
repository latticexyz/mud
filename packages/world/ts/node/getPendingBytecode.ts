import { Hex, sliceHex } from "viem";
import { ContractArtifact, DeployableReference, PendingBytecode } from "./common";

export function getPendingBytecode(target: ContractArtifact, artifacts: readonly ContractArtifact[]): PendingBytecode {
  const bytecode: (Hex | DeployableReference)[] = [];
  let offset = 0;
  for (const placeholder of target.placeholders) {
    const artifact = artifacts.find((a) => a.sourcePath === placeholder.sourcePath && a.name === placeholder.name);
    if (!artifact) {
      throw new Error(
        // eslint-disable-next-line max-len
        `Could not find build artifact for reference \`${placeholder.name}\` at \`${placeholder.sourcePath}\` used by \`${target.name}\` at \`${target.sourcePath}\`. Did \`forge build\` run successfully?`,
      );
    }

    bytecode.push(sliceHex(target.bytecode, offset, placeholder.start));
    bytecode.push({ deployable: `${artifact.sourcePath}:${artifact.name}` });
    offset = placeholder.start + placeholder.length;
  }
  bytecode.push(sliceHex(target.bytecode, offset));
  return bytecode;
}
