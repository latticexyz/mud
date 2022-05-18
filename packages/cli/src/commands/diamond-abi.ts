import fs from "fs";
import glob from "glob";
import type { Arguments, CommandBuilder } from "yargs";
import { deferred } from "../utils";

type Options = {
  include: (string | number)[] | undefined;
  exclude: (string | number)[] | undefined;
  out: string | undefined;
};

export const command = "diamond-abi";
export const desc = "Merges the abis of different facets of a diamond to a single diamond abi";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    include: { type: "array" },
    exclude: { type: "array" },
    out: { type: "string" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { include: _include, exclude: _exclude, out: _out } = argv;
  const wd = process.cwd();
  console.log("Current working directory:", wd);

  const include = (_include as string[]) || [`${wd}/abi/*Facet.json`];
  const exclude =
    (_exclude as string[]) ||
    ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"].map((file) => `./abi/${file}.json`);
  const out = _out || `${wd}/abi/CombinedFacets.json`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const abi: any[] = [];

  for (const path of include) {
    const [resolve, , promise] = deferred<void>();
    glob(path, {}, (_, facets) => {
      // Merge all abis matching the path glob
      const pathAbi = facets
        .filter((facet) => !exclude.includes(facet))
        .map((facet) => require(facet))
        .map((abis) => abis.abi)
        .flat(1);

      abi.push(...pathAbi);
      resolve();
    });

    // Make the callback syncronous
    await promise;
  }

  fs.writeFileSync(out, JSON.stringify({ abi }));

  console.log(`Created diamond abi at ${out}`);
  process.exit(0);
};
