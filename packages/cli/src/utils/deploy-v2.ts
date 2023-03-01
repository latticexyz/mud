import { execa } from "execa";
import { readFileSync } from "fs";
import path from "path";
import { ResolvedWorldConfig } from "../config/loadWorldConfig.js";
import { MUDError } from "./errors.js";
import { cast, forge } from "./foundry.js";
import { getOutDirectory } from "./forgeConfig.js";

export interface DeployConfig {
  rpc: string;
  privateKey: string;
}

// function loadContractData(src: string): { bytecode: string; abi: ContractInterface } {
//   let data: any;
//   try {
//     data = JSON.parse(readFileSync(src, "utf8"));
//   } catch (error: any) {
//     throw new MUDError(`Error reading file at ${src}: ${error?.message}`);
//   }

//   const bytecode = data?.bytecode?.object;
//   if (!bytecode) throw new MUDError(`No bytecode found in ${src}`);

//   const abi = data?.abi;
//   if (!abi) throw new MUDError(`No ABI found in ${src}`);

//   return { abi, bytecode };
// }

export async function deploy(worldConfig: ResolvedWorldConfig, deployConfig: DeployConfig) {
  // TODO: Deploy World (either vanilla or overridden)
  const { worldContractName } = worldConfig;
  const { rpc, privateKey } = deployConfig;

  // Get block number before deploying
  const blockNumber = Number(await cast("block-number", "--rpc-url", rpc));
  console.log("Start deployment at block", blockNumber);

  // Deploy World contract
  const { deployedTo: worldAddress } = JSON.parse(
    await forge("create", worldContractName, "--rpc-url", rpc, "--private-key", privateKey, "--json")
  );
  console.log("Deployed World to", worldAddress);

  // TODO: Register tables
  const { status } = JSON.parse(
    await cast(
      "send",
      "--rpc-url",
      rpc,
      "--private-key",
      privateKey,
      "--json",
      worldAddress,
      "registerRoute(string,string)",
      "",
      "/test"
    )
  );

  if (status !== "0x1") throw new MUDError(`Failed to register route /test`);

  // TODO: Deploy systems
  // TODO: Grant access to systems
  // TODO: Execute postDeploy forge script
}
