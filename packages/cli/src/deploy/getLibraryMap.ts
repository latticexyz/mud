import { Address } from "viem";
import { Library } from "./common";

export type LibraryMap = {
  getAddress: (opts: { path: string; name: string; deployer: Address }) => Address;
};

function getLibraryKey({ path, name }: { path: string; name: string }): string {
  return `${path}:${name}`;
}

type LibraryCache = {
  [key: string]: Library & {
    address?: {
      [deployer: Address]: Address;
    };
  };
};

export function getLibraryMap(libraries: readonly Library[]): LibraryMap {
  const cache: LibraryCache = Object.fromEntries(libraries.map((library) => [getLibraryKey(library), library]));
  const libraryMap = {
    getAddress: ({ path, name, deployer }) => {
      const library = cache[getLibraryKey({ path, name })];
      if (!library) {
        throw new Error(`Could not find library for bytecode placeholder ${path}:${name}`);
      }
      library.address ??= {};
      // Store the prepared address in the library cache to avoid preparing the same library twice
      library.address[deployer] ??= library.prepareDeploy(deployer, libraryMap).address;
      return library.address[deployer];
    },
  } satisfies LibraryMap;
  return libraryMap;
}
