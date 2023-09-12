import chalk from "chalk";
import { readFileSync } from "fs";
import path from "path";
import { BigNumber, ContractInterface, Wallet, ethers } from "ethers";
import { Fragment } from "ethers/lib/utils.js";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { MUDError } from "@latticexyz/common/errors";

export type CallData = {
  func: string;
  args: unknown[];
};

type ContractNames = string[];

export type ContractCode = {
  name: string;
  abi: ContractInterface;
  bytecode: string | { object: string };
};

export type TxConfig = {
  signer: ethers.Wallet;
  nonce: number;
  maxPriorityFeePerGas: number | undefined;
  maxFeePerGas: BigNumber | undefined;
  gasPrice: BigNumber | undefined;
  debug: boolean;
  confirmations: number;
};

export function deployContractsByCode(
  input: TxConfig & { contracts: ContractCode[] }
): Record<string, Promise<string>> {
  // TODO - can check via Create2 in future
  return input.contracts.reduce<Record<string, Promise<string>>>((acc, contract) => {
    acc[contract.name] = deployContract({
      ...input,
      nonce: input.nonce++,
      contract,
    });
    return acc;
  }, {});
}

export function deployContractsByName(
  input: TxConfig & { contracts: ContractNames; forgeOutDirectory: string }
): Record<string, Promise<string>> {
  // TODO - can check via Create2 in future
  return input.contracts.reduce<Record<string, Promise<string>>>((acc, contractName) => {
    console.log(chalk.blue(`Deploying ${contractName}`));
    acc[contractName] = deployContractByName({
      ...input,
      nonce: input.nonce++,
      contractName,
    });
    return acc;
  }, {});
}

export async function deployContract(input: TxConfig & { contract: ContractCode }): Promise<string> {
  const { signer, nonce, maxPriorityFeePerGas, maxFeePerGas, debug, gasPrice, confirmations, contract } = input;

  try {
    const factory = new ethers.ContractFactory(contract.abi, contract.bytecode, signer);
    console.log(chalk.gray(`executing deployment of ${contract.name} with nonce ${nonce}`));
    const deployPromise = factory
      .deploy({
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasPrice,
      })
      .then((c) => (confirmations ? c : c.deployed()));
    const { address } = await deployPromise;
    console.log(chalk.green("Deployed", contract.name, "to", address));
    return address;
  } catch (error: any) {
    if (debug) console.error(error);
    if (error?.message.includes("invalid bytecode")) {
      throw new MUDError(
        `Error deploying ${contract.name}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
      );
    } else if (error?.message.includes("CreateContractLimit")) {
      throw new MUDError(`Error deploying ${contract.name}: CreateContractLimit exceeded.`);
    } else throw error;
  }
}

export async function deployContractByName(
  input: TxConfig & { contractName: string; forgeOutDirectory: string }
): Promise<string> {
  const { abi, bytecode } = getContractData(input.contractName, input.forgeOutDirectory);
  return deployContract({
    ...input,
    contract: {
      name: input.contractName,
      abi,
      bytecode,
    },
  });
}

/**
 * Load the contract's abi and bytecode from the file system
 * @param contractName: Name of the contract to load
 */
export function getContractData(
  contractName: string,
  forgeOutDirectory: string
): { bytecode: string; abi: Fragment[] } {
  let data: any;
  const contractDataPath = path.join(forgeOutDirectory, contractName + ".sol", contractName + ".json");
  try {
    data = JSON.parse(readFileSync(contractDataPath, "utf8"));
  } catch (error: any) {
    throw new MUDError(`Error reading file at ${contractDataPath}`);
  }

  const bytecode = data?.bytecode?.object;
  if (!bytecode) throw new MUDError(`No bytecode found in ${contractDataPath}`);

  const abi = data?.abi;
  if (!abi) throw new MUDError(`No ABI found in ${contractDataPath}`);

  return { abi, bytecode };
}

/**
 * Only await gas estimation (for speed), only execute if gas estimation succeeds (for safety)
 */
export async function fastTxExecute<
  C extends { connect: any; estimateGas: any; [key: string]: any },
  F extends keyof C
>(
  input: TxConfig & {
    contract: C;
    func: F;
    args: Parameters<C[F]>;
    confirmations: number;
  }
): Promise<TransactionResponse | TransactionReceipt> {
  const {
    func,
    args,
    contract,
    signer,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice,
    confirmations = 1,
    debug,
  } = input;
  const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
  try {
    const contractWithSigner = contract.connect(signer);
    const gasLimit = await contractWithSigner.estimateGas[func].apply(null, args);
    console.log(chalk.gray(`executing transaction: ${functionName} with nonce ${nonce}`));
    return contractWithSigner[func]
      .apply(null, [
        ...args,
        {
          gasLimit,
          nonce: nonce,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          maxFeePerGas: maxFeePerGas,
          gasPrice: gasPrice,
        },
      ])
      .then((tx: TransactionResponse) => {
        return confirmations === 0 ? tx : tx.wait(confirmations);
      });
  } catch (error: any) {
    if (debug) console.error(error);
    throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
  }
}

export async function confirmNonce(signer: Wallet, nonce: number, pollInterval: number): Promise<void> {
  let remoteNonce = await signer.getTransactionCount();
  let retryCount = 0;
  const maxRetries = 100;
  while (remoteNonce !== nonce && retryCount < maxRetries) {
    console.log(
      chalk.gray(
        `Waiting for transactions to be included before executing postDeployScript (local nonce: ${nonce}, remote nonce: ${remoteNonce}, retry number ${retryCount}/${maxRetries})`
      )
    );
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
    retryCount++;
    remoteNonce = await signer.getTransactionCount();
  }
  if (remoteNonce !== nonce) {
    throw new MUDError(
      "Remote nonce doesn't match local nonce, indicating that not all deploy transactions were included."
    );
  }
}

/**
 * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
 * The multiplier is used to allow replacing pending transactions.
 * @param multiplier Multiplier to apply to the base fee
 */
export async function setInternalFeePerGas(
  signer: Wallet,
  multiplier: number
): Promise<{
  maxPriorityFeePerGas: number | undefined;
  maxFeePerGas: BigNumber | undefined;
  gasPrice: BigNumber | undefined;
}> {
  // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
  const feeData = await signer.provider.getFeeData();
  let maxPriorityFeePerGas: number | undefined;
  let maxFeePerGas: BigNumber | undefined;
  let gasPrice: BigNumber | undefined;

  if (feeData.lastBaseFeePerGas) {
    if (!feeData.lastBaseFeePerGas.eq(0) && (await signer.getBalance()).eq(0)) {
      throw new MUDError(`Attempting to deploy to a chain with non-zero base fee with an account that has no balance.
        If you're deploying to the Lattice testnet, you can fund your account by running 'pnpm mud faucet --address ${await signer.getAddress()}'`);
    }

    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0) ? 0 : Math.floor(1_500_000_000 * multiplier);
    maxFeePerGas = feeData.lastBaseFeePerGas.mul(2).add(maxPriorityFeePerGas);
  } else if (feeData.gasPrice) {
    // Legacy chains with gasPrice instead of maxFeePerGas
    if (!feeData.gasPrice.eq(0) && (await signer.getBalance()).eq(0)) {
      throw new MUDError(
        `Attempting to deploy to a chain with non-zero gas price with an account that has no balance.`
      );
    }

    gasPrice = feeData.gasPrice;
  } else {
    throw new MUDError("Can not fetch fee data from RPC");
  }
  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice,
  };
}
