import { LibraryPlaceholder } from "./common";
import { linkReferences } from "./types";

export function getPlaceholders(refs: typeof linkReferences.infer): readonly LibraryPlaceholder[] {
  return Object.entries(refs).flatMap(([sourcePath, names]) =>
    Object.entries(names).flatMap(([name, slices]) => slices.map((slice) => ({ sourcePath, name, ...slice }))),
  );
}
