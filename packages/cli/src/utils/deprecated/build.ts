import { execa } from "execa";
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import path from "path";
import { getOutDirectory } from "@latticexyz/common/foundry";

export async function forgeBuild(options?: { clear?: boolean }) {
  if (options?.clear) {
    const out = await getOutDirectory();
    console.log("Clearing forge build output directory", out);
    rmSync(out, { recursive: true, force: true });
  }

  console.log("Running forge build");
  const child = execa("forge", ["build"], {
    stdio: ["inherit", "pipe", "inherit"],
  });

  return (await child).stdout;
}

function getContractsInDirectory(dir: string, exclude?: string[]) {
  return readdirSync(dir)
    .filter((item) => item.includes(".sol"))
    .map((item) => item.replace(".sol", ""))
    .filter((item) => !exclude?.includes(item));
}

function copyAbi(inDir: string, outDir: string, contract: string) {
  try {
    return copyFileSync(path.join(inDir, contract + ".sol", contract + ".json"), path.join(outDir, contract + ".json"));
  } catch (e) {
    console.log("Skipping", contract);
  }
}

export function filterAbi(abiIn = "./out", abiOut = "./abi", exclude: string[] = ["Component", "IComponent"]) {
  // Clean our dir
  console.log(`Cleaning output directory (${abiOut}})`);
  rmSync(abiOut, { recursive: true, force: true });
  mkdirSync(abiOut);

  // Only include World, LibQuery, *Component, *System
  const include = ["Component", "System", "World", "LibQuery"];
  const contracts = getContractsInDirectory(abiIn, exclude).filter((item) => include.find((i) => item.includes(i)));

  console.log("Selected ABIs: ", contracts);

  // Move selected ABIs to ./abi
  for (const contract of contracts) {
    if (contract.includes(".t")) continue;
    copyAbi(abiIn, abiOut, contract);
  }

  console.log("Successfully moved selected ABIs to ./abi");
}
