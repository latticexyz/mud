import chalk from "chalk";
import { Contract, ethers } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { ParamType } from "ethers/lib/utils.js";
import { tableIdToHex } from "@latticexyz/common";
import { getContractData, TxConfig, fastTxExecute } from "./txHelpers";

type SystemsConfig = Record<
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

export async function registerSystems(
  input: TxConfig & {
    worldContract: Contract;
    systems: SystemsConfig;
    systemContracts: Record<string, Promise<string>>;
    namespace: string;
    forgeOutDirectory: string;
  }
): Promise<number> {
  console.log(chalk.blue("Registering Systems & Functions"));
  const { systems, namespace, worldContract, systemContracts, forgeOutDirectory } = input;
  // Register systems
  const systemRegisterPromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const [systemName, { name, openAccess, registerFunctionSelectors }] of Object.entries(systems)) {
    // Register system at route
    console.log(chalk.blue(`Registering system ${systemName} at ${namespace}/${name}`));
    systemRegisterPromises.push(
      fastTxExecute({
        ...input,
        nonce: input.nonce++,
        contract: worldContract,
        func: "registerSystem",
        args: [tableIdToHex(namespace, name), await systemContracts[systemName], openAccess],
      })
    );

    // Register function selectors for the system - non-blocking for tx, await all at end
    if (registerFunctionSelectors) {
      const functionSignatures: FunctionSignature[] = loadFunctionSignatures(systemName, forgeOutDirectory);
      const isRoot = namespace === "";
      for (const { functionName, functionArgs } of functionSignatures) {
        const functionSignature = isRoot
          ? functionName + functionArgs
          : `${namespace}_${name}_${functionName}${functionArgs}`;

        console.log(chalk.blue(`Registering function "${functionSignature}"`));
        if (isRoot) {
          const worldFunctionSelector = toFunctionSelector(
            functionSignature === ""
              ? { functionName: systemName, functionArgs } // Register the system's fallback function as `<systemName>(<args>)`
              : { functionName, functionArgs }
          );
          const systemFunctionSelector = toFunctionSelector({ functionName, functionArgs });
          systemRegisterPromises.push(
            fastTxExecute({
              ...input,
              nonce: input.nonce++,
              contract: worldContract,
              func: "registerRootFunctionSelector",
              args: [tableIdToHex(namespace, name), worldFunctionSelector, systemFunctionSelector],
            })
          );
        } else {
          systemRegisterPromises.push(
            fastTxExecute({
              ...input,
              nonce: input.nonce++,
              contract: worldContract,
              func: "registerFunctionSelector",
              args: [tableIdToHex(namespace, name), functionName, functionArgs],
            })
          );
        }
      }
    }
  }
  await Promise.all(systemRegisterPromises);
  console.log(chalk.green(`Registered Systems & Functions`));
  return input.nonce;
}

export async function grantAccess(
  input: TxConfig & {
    worldContract: Contract;
    systems: SystemsConfig;
    systemContracts: Record<string, Promise<string>>;
    namespace: string;
  }
): Promise<number> {
  console.log(chalk.blue("Granting Access"));
  const { systems, namespace, worldContract, systemContracts } = input;
  // non-blocking for tx, await all at end
  const grantPromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const [systemName, { name, accessListAddresses, accessListSystems }] of Object.entries(systems)) {
    const resourceSelector = `${namespace}/${name}`;

    // Grant access to addresses
    accessListAddresses.map(async (address) => {
      console.log(chalk.blue(`Grant ${address} access to ${systemName} (${resourceSelector})`));
      grantPromises.push(
        fastTxExecute({
          ...input,
          nonce: input.nonce++,
          contract: worldContract,
          func: "grantAccess",
          args: [tableIdToHex(namespace, name), address],
        })
      );
    });

    // Grant access to other systems
    accessListSystems.map(async (granteeSystem) => {
      console.log(chalk.blue(`Grant ${granteeSystem} access to ${systemName} (${resourceSelector})`));
      grantPromises.push(
        fastTxExecute({
          ...input,
          nonce: input.nonce++,
          contract: worldContract,
          func: "grantAccess",
          args: [tableIdToHex(namespace, name), await systemContracts[granteeSystem]],
        })
      );
    });
  }
  await Promise.all(grantPromises);
  console.log(chalk.green(`Access Granted`));
  return input.nonce;
}

function loadFunctionSignatures(contractName: string, forgeOutDirectory: string): FunctionSignature[] {
  const { abi } = getContractData(contractName, forgeOutDirectory);

  return abi
    .filter((item) => ["fallback", "function"].includes(item.type))
    .map((item) => {
      if (item.type === "fallback") return { functionName: "", functionArgs: "" };

      return {
        functionName: item.name,
        functionArgs: parseComponents(item.inputs),
      };
    });
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toFunctionSelector({ functionName, functionArgs }: FunctionSignature): string {
  const functionSignature = functionName + functionArgs;
  if (functionSignature === "") return "0x";
  return sigHash(functionSignature);
}

/**
 * Recursively turn (nested) structs in signatures into tuples
 */
function parseComponents(params: ParamType[]): string {
  const components = params.map((param) => {
    const tupleMatch = param.type.match(/tuple(.*)/);
    if (tupleMatch) {
      // there can be arrays of tuples,
      // `tupleMatch[1]` preserves the array brackets (or is empty string for non-arrays)
      return parseComponents(param.components) + tupleMatch[1];
    } else {
      return param.type;
    }
  });
  return `(${components})`;
}

// TODO: move this to utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function sigHash(signature: string) {
  return ethers.utils.hexDataSlice(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)), 0, 4);
}
