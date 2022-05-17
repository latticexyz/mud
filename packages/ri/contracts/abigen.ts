import fs from "fs";
import glob from "glob";

const exclude = ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"];
const excludeFileNames = exclude.map((file) => `./abi/${file}.json`);

glob("./abi/*Facet.json", {}, (_, facets) => {
  const abi = facets
    .filter((facet) => !excludeFileNames.includes(facet))
    .map((facet) => require(facet))
    .map((abis) => abis.abi)
    .flat(1);

  fs.writeFileSync("./abi/CombinedFacets.json", JSON.stringify({ abi }));
});
