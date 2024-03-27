import { LibraryPlaceholder } from "../deploy/common";

// TODO: move this to a broader solc artifact type
/** From `artifact.bytecode.linkReferences` where `artifact` is the solc JSON output of a compiled Solidity contract */
export type LinkReferences = {
  [filename: string]: {
    [name: string]: {
      start: number;
      length: number;
    }[];
  };
};

export function findPlaceholders(linkReferences: LinkReferences): readonly LibraryPlaceholder[] {
  return Object.entries(linkReferences).flatMap(([path, contracts]) =>
    Object.entries(contracts).flatMap(([contractName, locations]) =>
      locations.map(
        (location): LibraryPlaceholder => ({
          path,
          name: contractName,
          start: location.start,
          length: location.length,
        }),
      ),
    ),
  );
}
