import { ContractArtifact } from "./common";

export function getDependencies(
  target: ContractArtifact,
  artifacts: readonly ContractArtifact[],
): readonly ContractArtifact[] {
  return target.placeholders.flatMap(({ sourcePath, name }) => {
    const artifact = artifacts.find((a) => a.sourcePath === sourcePath && a.name === name);
    if (!artifact) {
      throw new Error(
        // eslint-disable-next-line max-len
        `Could not find build artifact for reference \`${name}\` at \`${sourcePath}\` used by \`${target.name}\` at \`${target.sourcePath}\`. Did \`forge build\` run successfully?`,
      );
    }
    return [artifact, ...getDependencies(artifact, artifacts)];
  });
}
