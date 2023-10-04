import chalk from "chalk";
import { MUDError } from "@latticexyz/common/errors";
import { ContractCode } from "./types";
import { Abi, Hex, WalletClient, PublicClient, Account, Address, Chain } from "viem";

export async function deployContract(input: {
  contract: ContractCode;
  walletClient: WalletClient;
  publicClient: PublicClient;
  account: Account | Address;
  debug: boolean;
  chain: Chain;
  nonce: number;
}): Promise<string> {
  const { debug, contract, publicClient, account, walletClient, chain, nonce } = input;

  try {
    const hash = await walletClient.deployContract({
      account,
      chain,
      abi: contract.abi as Abi,
      bytecode: typeof contract.bytecode === "string" ? (contract.bytecode as Hex) : (contract.bytecode.object as Hex),
      nonce,
    });
    if (!hash) throw new MUDError(`Error deploying ${contract.name}, no hash for deploy tx.`);

    console.log(chalk.gray(`executing deployment of ${contract.name} ${nonce}`));
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(chalk.green("Deployed", contract.name, "to", receipt.contractAddress));
    return receipt.contractAddress as string;
  } catch (error: any) {
    if (debug) console.error(error);
    if (error?.message.includes("invalid bytecode")) {
      throw new MUDError(
        `Error deploying ${contract.name}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
      );
    } else if (error?.message.includes("CreateContractLimit")) {
      throw new MUDError(`Error deploying ${contract.name}: CreateContractLimit exceeded.`);
    } else if (error?.message.includes("Nonce too high")) {
      const delayMs = 100;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return deployContract(input);
    } else throw Error;
  }
}
