import { copyFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import path from "path";
import { execLog } from "./exec";

export function forgeBuild(out = "out", options?: { clear?: boolean }) {
  if (options?.clear) {
    console.log("Clearing forge build output directory", out);
    rmSync(out, { recursive: true, force: true });
  }
  return execLog("forge", ["build", "-o", out]);
}

function getContractsInDir(dir: string, exclude?: string[]) {
  return readdirSync(dir)
    .filter((item) => item.includes(".sol"))
    .map((item) => item.replace(".sol", ""))
    .filter((item) => !exclude?.includes(item));
}

function copyAbi(inDir: string, outDir: string, contract: string) {
  return copyFileSync(path.join(inDir, contract + ".sol", contract + ".json"), path.join(outDir, contract + ".json"));
}

export function filterAbi(
  abiIn = "./out",
  abiOut = "./abi",
  exclude: string[] = ["Component", "IComponent"]
) {
  // Clean our dir
  console.log(`Cleaning output directory (${abiOut}})`);
  rmSync(abiOut, { recursive: true, force: true });
  mkdirSync(abiOut);

  // Only include World, LibQuery, *Component, *System
  const include = ["Component", "System", "World", "LibQuery"];
  const contracts = getContractsInDir(abiIn, exclude).filter((item) => include.find((i) => item.includes(i)));

  console.log("Selected ABIs: ", contracts);

  // Move selected ABIs to ./abi
  for (const contract of contracts) copyAbi(abiIn, abiOut, contract);

  console.log("Successfully moved selected ABIs to ./abi");
}
