import { Hex } from "viem";
import { Library } from "./common";

export type LibraryMap = { [key: string]: Library & { address?: Hex } };

export function getLibraryMap(libraries: readonly Library[]): LibraryMap {
  return Object.fromEntries(libraries.map((library) => [getLibraryKey(library), library]));
}

export function getLibraryKey({ path, name }: { path: string; name: string }): string {
  return `${path}:${name}`;
}
