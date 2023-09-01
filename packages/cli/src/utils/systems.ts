import { readFileSync } from "fs";
import path from "path";
import chalk from "chalk";
import { Contract, ethers } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { Fragment, ParamType } from "ethers/lib/utils.js";

import { MUDError } from "@latticexyz/common/errors";
import { tableIdToHex } from "@latticexyz/common";
import { TxHelper } from "./txHelper";

export type SystemsConfig = Record<
  string,
  {
    name: string;
    registerFunctionSelectors: boolean;
    openAccess: boolean;
    accessListAddresses: string[];
    accessListSystems: string[];
  }
>;

interface FunctionSignature {
  functionName: string;
  functionArgs: string;
}

export class Systems {
  private systemContracts: Record<string, Promise<string>> = {};
  constructor(
    private config: {
      txHelper: TxHelper;
      disableTxWait: boolean;
      systems: SystemsConfig;
      namespace: string;
      forgeOutDirectory: string;
    }
  ) {}

  async deployContracts() {
    // Deploy Systems - can include check via Create2 in future
    this.systemContracts = Object.keys(this.config.systems).reduce<Record<string, Promise<string>>>(
      (acc, systemName) => {
        console.log(chalk.blue(`Deploying ${systemName}`));
        acc[systemName] = this.config.txHelper.deployContractByName(systemName, this.config.disableTxWait);
        return acc;
      },
      {}
    );
  }

  async registerSystems(worldContract: Contract): Promise<void> {
    console.log(chalk.blue("Registering Systems & Functions"));
    const confirmations = this.config.disableTxWait ? 0 : 1;
    // Register systems
    const systemRegisterPromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
    for (const [systemName, { name, openAccess, registerFunctionSelectors }] of Object.entries(this.config.systems)) {
      // Register system at route
      console.log(chalk.blue(`Registering system ${systemName} at ${this.config.namespace}/${name}`));
      systemRegisterPromises.push(
        this.config.txHelper.fastTxExecute(
          worldContract,
          "registerSystem",
          [tableIdToHex(this.config.namespace, name), await this.systemContracts[systemName], openAccess],
          confirmations
        )
      );

      // Register function selectors for the system - non-blocking for tx, await all at end
      if (registerFunctionSelectors) {
        const functionSignatures: FunctionSignature[] = this.loadFunctionSignatures(systemName);
        const isRoot = this.config.namespace === "";
        for (const { functionName, functionArgs } of functionSignatures) {
          const functionSignature = isRoot
            ? functionName + functionArgs
            : `${this.config.namespace}_${name}_${functionName}${functionArgs}`;

          console.log(chalk.blue(`Registering function "${functionSignature}"`));
          if (isRoot) {
            const worldFunctionSelector = this.toFunctionSelector(
              functionSignature === ""
                ? { functionName: systemName, functionArgs } // Register the system's fallback function as `<systemName>(<args>)`
                : { functionName, functionArgs }
            );
            const systemFunctionSelector = this.toFunctionSelector({ functionName, functionArgs });
            systemRegisterPromises.push(
              this.config.txHelper.fastTxExecute(
                worldContract,
                "registerRootFunctionSelector",
                [tableIdToHex(this.config.namespace, name), worldFunctionSelector, systemFunctionSelector],
                confirmations
              )
            );
          } else {
            systemRegisterPromises.push(
              this.config.txHelper.fastTxExecute(
                worldContract,
                "registerFunctionSelector",
                [tableIdToHex(this.config.namespace, name), functionName, functionArgs],
                confirmations
              )
            );
          }
        }
      }
    }
    await Promise.all(systemRegisterPromises);
    console.log(chalk.green(`Registered Systems & Functions`));
  }

  async grantAccess(worldContract: Contract): Promise<void> {
    console.log(chalk.blue("Granting Access"));
    const confirmations = this.config.disableTxWait ? 0 : 1;

    // non-blocking for tx, await all at end
    const grantPromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
    for (const [systemName, { name, accessListAddresses, accessListSystems }] of Object.entries(this.config.systems)) {
      const resourceSelector = `${this.config.namespace}/${name}`;

      // Grant access to addresses
      accessListAddresses.map(async (address) => {
        console.log(chalk.blue(`Grant ${address} access to ${systemName} (${resourceSelector})`));
        grantPromises.push(
          this.config.txHelper.fastTxExecute(
            worldContract,
            "grantAccess",
            [tableIdToHex(this.config.namespace, name), address],
            confirmations
          )
        );
      });

      // Grant access to other systems
      accessListSystems.map(async (granteeSystem) => {
        console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${resourceSelector})`));
        grantPromises.push(
          this.config.txHelper.fastTxExecute(
            worldContract,
            "grantAccess",
            [tableIdToHex(this.config.namespace, name), await this.systemContracts[granteeSystem]],
            confirmations
          )
        );
      });
    }
    await Promise.all(grantPromises);
    console.log(chalk.green(`Access Granted`));
  }

  private loadFunctionSignatures(contractName: string): FunctionSignature[] {
    const { abi } = this.getContractData(contractName);

    return abi
      .filter((item) => ["fallback", "function"].includes(item.type))
      .map((item) => {
        if (item.type === "fallback") return { functionName: "", functionArgs: "" };

        return {
          functionName: item.name,
          functionArgs: this.parseComponents(item.inputs),
        };
      });
  }

  /**
   * Recursively turn (nested) structs in signatures into tuples
   */
  private parseComponents(params: ParamType[]): string {
    const components = params.map((param) => {
      const tupleMatch = param.type.match(/tuple(.*)/);
      if (tupleMatch) {
        // there can be arrays of tuples,
        // `tupleMatch[1]` preserves the array brackets (or is empty string for non-arrays)
        return this.parseComponents(param.components) + tupleMatch[1];
      } else {
        return param.type;
      }
    });
    return `(${components})`;
  }

  /**
   * Load the contract's abi and bytecode from the file system
   * @param contractName: Name of the contract to load
   */
  private getContractData(contractName: string): { bytecode: string; abi: Fragment[] } {
    let data: any;
    const contractDataPath = path.join(this.config.forgeOutDirectory, contractName + ".sol", contractName + ".json");
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

  // TODO: move this to utils as soon as utils are usable inside cli
  // (see https://github.com/latticexyz/mud/issues/499)
  private toFunctionSelector({ functionName, functionArgs }: FunctionSignature): string {
    const functionSignature = functionName + functionArgs;
    if (functionSignature === "") return "0x";
    return this.sigHash(functionSignature);
  }

  // TODO: move this to utils as soon as utils are usable inside cli
  // (see https://github.com/latticexyz/mud/issues/499)
  private sigHash(signature: string) {
    return ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)), 0, 4);
  }
}
