import chalk from "chalk";
import { MUDError } from "@latticexyz/common/errors";
import { ContractCode } from "./types";
import { Abi, Hex, Account, Address, encodeDeployData, Client } from "viem";
import { sendTransaction } from "@latticexyz/common";

export async function deployContract(args: {
  contract: ContractCode;
  client: Client;
  account: Account | Address;
  debug: boolean;
  nonce: number;
}): Promise<Hex> {
  const { debug, contract, account, client, nonce } = args;
  try {
    const calldata = encodeDeployData({
      abi: contract.abi as Abi,
      bytecode: typeof contract.bytecode === "string" ? (contract.bytecode as Hex) : (contract.bytecode.object as Hex),
    });

    return await sendTransaction(client, {
      chain: null,
      account,
      data: calldata,
    });
  } catch (error: any) {
    console.error(error);
    if (error?.message.includes("invalid bytecode")) {
      throw new MUDError(
        `Error deploying ${contract.name}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
      );
    } else if (error?.message.includes("CreateContractLimit")) {
      throw new MUDError(`Error deploying ${contract.name}: CreateContractLimit exceeded.`);
    } else if (error?.message.includes("Nonce too high")) {
      const delayMs = 100;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return deployContract(args);
    } else throw Error;
  }
}
