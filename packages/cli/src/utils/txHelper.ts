import chalk from "chalk";
import { readFileSync } from "fs";
import path from "path";
import { BigNumber, ContractInterface, ethers } from "ethers";
import { MUDError } from "@latticexyz/common/errors";
import { Fragment } from "ethers/lib/utils.js";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";

type TxHelperConfig = {
  signer: ethers.Wallet;
  priorityFeeMultiplier: number;
  forgeOutDirectory: string;
  debug?: boolean;
};

export class TxHelper {
  private signer: ethers.Wallet;
  private maxPriorityFeePerGas: number | undefined;
  private maxFeePerGas: BigNumber | undefined;
  private gasPrice: BigNumber | undefined;
  private priorityFeeMultiplier: number;
  private forgeOutDirectory: string;
  private debug: boolean;
  public nonce = 0;

  constructor(config: TxHelperConfig) {
    this.signer = config.signer;
    this.priorityFeeMultiplier = config.priorityFeeMultiplier;
    this.forgeOutDirectory = config.forgeOutDirectory;
    this.debug = !!config.debug;
  }

  /**
   * Setup initial nonce and InternalFeePerGas
   */
  async initialise(): Promise<void> {
    const initialNonce = await this.signer.getTransactionCount();
    console.log("Initial nonce", initialNonce);
    this.nonce = initialNonce;
    await this.setInternalFeePerGas(this.priorityFeeMultiplier);
  }

  async deployContract(
    abi: ContractInterface,
    bytecode: string | { object: string },
    disableTxWait: boolean,
    contractName?: string,
    retryCount = 0
  ): Promise<string> {
    try {
      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);
      console.log(chalk.gray(`executing deployment of ${contractName} with nonce ${this.nonce}`));
      const deployPromise = factory
        .deploy({
          nonce: this.nonce++,
          maxPriorityFeePerGas: this.maxPriorityFeePerGas,
          maxFeePerGas: this.maxFeePerGas,
          gasPrice: this.gasPrice,
        })
        .then((c) => (disableTxWait ? c : c.deployed()));
      const { address } = await deployPromise;
      console.log(chalk.green("Deployed", contractName, "to", address));
      return address;
    } catch (error: any) {
      if (this.debug) console.error(error);
      if (retryCount === 0 && error?.message.includes("transaction already imported")) {
        // If the deployment failed because the transaction was already imported,
        // retry with a higher priority fee
        this.setInternalFeePerGas(this.priorityFeeMultiplier * 1.1);
        return this.deployContract(abi, bytecode, disableTxWait, contractName, retryCount++);
      } else if (error?.message.includes("invalid bytecode")) {
        throw new MUDError(
          `Error deploying ${contractName}: invalid bytecode. Note that linking of public libraries is not supported yet, make sure none of your libraries use "external" functions.`
        );
      } else if (error?.message.includes("CreateContractLimit")) {
        throw new MUDError(`Error deploying ${contractName}: CreateContractLimit exceeded.`);
      } else throw error;
    }
  }

  /**
   * Deploy a contract and return the address
   * @param contractName Name of the contract to deploy (must exist in the file system)
   * @param disableTxWait Disable waiting for contract deployment
   * @returns Address of the deployed contract
   */
  async deployContractByName(contractName: string, disableTxWait: boolean): Promise<string> {
    const { abi, bytecode } = await this.getContractData(contractName);
    return this.deployContract(abi, bytecode, disableTxWait, contractName);
  }

  /**
   * Load the contract's abi and bytecode from the file system
   * @param contractName: Name of the contract to load
   */
  async getContractData(contractName: string): Promise<{ bytecode: string; abi: Fragment[] }> {
    let data: any;
    const contractDataPath = path.join(this.forgeOutDirectory, contractName + ".sol", contractName + ".json");
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
  async fastTxExecute<C extends { connect: any; estimateGas: any; [key: string]: any }, F extends keyof C>(
    contract: C,
    func: F,
    args: Parameters<C[F]>,
    confirmations = 1,
    retryCount = 0
  ): Promise<TransactionResponse | TransactionReceipt> {
    const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
    try {
      const contractWithSigner = contract.connect(this.signer);
      const gasLimit = await contractWithSigner.estimateGas[func].apply(null, args);
      console.log(chalk.gray(`executing transaction: ${functionName} with nonce ${this.nonce}`));
      return contractWithSigner[func]
        .apply(null, [
          ...args,
          {
            gasLimit,
            nonce: this.nonce++,
            maxPriorityFeePerGas: this.maxPriorityFeePerGas,
            maxFeePerGas: this.maxFeePerGas,
            gasPrice: this.gasPrice,
          },
        ])
        .then((tx: TransactionResponse) => {
          return confirmations === 0 ? tx : tx.wait(confirmations);
        });
    } catch (error: any) {
      if (this.debug) console.error(error);
      if (retryCount === 0 && error?.message.includes("transaction already imported")) {
        // If the deployment failed because the transaction was already imported,
        // retry with a higher priority fee
        this.setInternalFeePerGas(this.priorityFeeMultiplier * 1.1);
        return this.fastTxExecute(contract, func, args, confirmations, retryCount++);
      } else throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
    }
  }

  /**
   * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
   * The multiplier is used to allow replacing pending transactions.
   * @param multiplier Multiplier to apply to the base fee
   */
  async setInternalFeePerGas(multiplier: number) {
    // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
    const feeData = await this.signer.provider.getFeeData();

    if (feeData.lastBaseFeePerGas) {
      if (!feeData.lastBaseFeePerGas.eq(0) && (await this.signer.getBalance()).eq(0)) {
        throw new MUDError(`Attempting to deploy to a chain with non-zero base fee with an account that has no balance.
        If you're deploying to the Lattice testnet, you can fund your account by running 'pnpm mud faucet --address ${await this.signer.getAddress()}'`);
      }

      // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
      this.maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0) ? 0 : Math.floor(1_500_000_000 * multiplier);
      this.maxFeePerGas = feeData.lastBaseFeePerGas.mul(2).add(this.maxPriorityFeePerGas);
    } else if (feeData.gasPrice) {
      // Legacy chains with gasPrice instead of maxFeePerGas
      if (!feeData.gasPrice.eq(0) && (await this.signer.getBalance()).eq(0)) {
        throw new MUDError(
          `Attempting to deploy to a chain with non-zero gas price with an account that has no balance.`
        );
      }

      this.gasPrice = feeData.gasPrice;
    } else {
      throw new MUDError("Can not fetch fee data from RPC");
    }
  }

  async confirmNonce(pollInterval: number): Promise<void> {
    let remoteNonce = await this.signer.getTransactionCount();
    let retryCount = 0;
    const maxRetries = 100;
    while (remoteNonce !== this.nonce && retryCount < maxRetries) {
      console.log(
        chalk.gray(
          `Waiting for transactions to be included before executing postDeployScript (local nonce: ${this.nonce}, remote nonce: ${remoteNonce}, retry number ${retryCount}/${maxRetries})`
        )
      );
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      retryCount++;
      remoteNonce = await this.signer.getTransactionCount();
    }
    if (remoteNonce !== this.nonce) {
      throw new MUDError(
        "Remote nonce doesn't match local nonce, indicating that not all deploy transactions were included."
      );
    }
  }
}
