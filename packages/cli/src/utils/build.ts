import { copyFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import path from "path";
import { getForgeConfig } from "./config";
import { execLog } from "./exec";

export async function forgeBuild(options?: { clear?: boolean }) {
  if (options?.clear) {
    const forgeConfig = await getForgeConfig();
    console.log("Clearing forge build output directory", forgeConfig.out);
    rmSync(forgeConfig.out, { recursive: true, force: true });
  }
  return execLog("forge", ["build"]);
}

function getContractsInDir(dir: string, exclude?: string[]) {
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

export async function filterAbi(abiOut = "./abi", exclude: string[] = ["Component", "IComponent"]) {
  // Get forge output dir
  const forgeConfig = await getForgeConfig();
  const abiIn = forgeConfig.out;

  // Clean abi dir
  console.log(`Cleaning ABI output directory (${abiOut})`);
  rmSync(abiOut, { recursive: true, force: true });
  mkdirSync(abiOut);

  // Only include World, LibQuery, *Component, *System
  const include = ["Component", "System", "World", "LibQuery"];
  const contracts = getContractsInDir(abiIn, exclude).filter((item) => include.find((i) => item.includes(i)));

  console.log("Selected ABIs: ", contracts);

  // Move selected ABIs to ./abi
  for (const contract of contracts) {
    if (contract.includes(".t")) continue;
    copyAbi(abiIn, abiOut, contract);
  }

  console.log("Successfully moved selected ABIs to ./abi");
}
