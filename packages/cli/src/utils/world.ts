import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { encodeSchema } from "@latticexyz/schema-type/deprecated";
import { StoreConfig } from "@latticexyz/store";
import { resolveAbiOrUserType } from "@latticexyz/store/codegen";
import { WorldConfig } from "@latticexyz/world";
import WorldData from "@latticexyz/world/abi/World.sol/World.json" assert { type: "json" };
import IBaseWorldData from "@latticexyz/world/abi/IBaseWorld.sol/IBaseWorld.json" assert { type: "json" };
import { tableIdToHex } from "@latticexyz/common";
import { TxConfig, deployContract, deployContractByName, fastTxExecute } from "./txHelpers";

export type TableIds = { [tableName: string]: Uint8Array };

export async function deployWorldContract(
  ip: TxConfig & { worldAddress: string | undefined; worldContractName: string | undefined; forgeOutDirectory: string }
): Promise<string> {
  console.log(chalk.blue(`Deploying World`));
  /* 
    Config allows:
    - existing worldAddress to be passed
    - world contract name to be passed
    Or deploy from base contract by default
    (Will also check create2 deployment here in future)
    */
  return ip.worldAddress
    ? Promise.resolve(ip.worldAddress)
    : ip.worldContractName
    ? deployContractByName({ ...ip, contractName: ip.worldContractName })
    : deployContract({
        ...ip,
        contract: { abi: IBaseWorldData.abi, bytecode: WorldData.bytecode, name: "World" },
      });
}

export async function registerNamesSpace(
  input: TxConfig & { worldContract: Contract; namespace: string | undefined; confirmations: number }
): Promise<number> {
  // Register namespace
  if (input.namespace)
    await fastTxExecute({
      ...input,
      nonce: input.nonce++,
      contract: input.worldContract,
      func: "registerNamespace",
      args: [toBytes16(input.namespace)],
      confirmations: input.confirmations,
    });
  return input.nonce;
}

export async function registerTables(
  input: TxConfig & {
    worldContract: Contract;
    namespace: string;
    mudConfig: StoreConfig & WorldConfig;
    confirmations: number;
  }
): Promise<{ tableIds: TableIds; nonce: number }> {
  console.log(chalk.blue("Registering Tables"));
  const tableIds: TableIds = {};
  // Register tables
  const tablePromises: Promise<TransactionResponse | TransactionReceipt>[] = [];
  for (const [tableName, { name, schema, keySchema }] of Object.entries(input.mudConfig.tables)) {
    console.log(chalk.blue(`Registering table ${tableName} at ${input.namespace}/${name}`));

    // Store the tableId for later use
    tableIds[tableName] = toResourceSelector(input.namespace, name);

    // Register table
    const schemaTypes = Object.values(schema).map((abiOrUserType) => {
      const { schemaType } = resolveAbiOrUserType(abiOrUserType, input.mudConfig);
      return schemaType;
    });

    const keyTypes = Object.values(keySchema).map((abiOrUserType) => {
      const { schemaType } = resolveAbiOrUserType(abiOrUserType, input.mudConfig);
      return schemaType;
    });

    tablePromises.push(
      fastTxExecute({
        ...input,
        nonce: input.nonce++,
        contract: input.worldContract,
        func: "registerTable",
        args: [
          tableIdToHex(input.namespace, name),
          encodeSchema(keyTypes),
          encodeSchema(schemaTypes),
          Object.keys(keySchema),
          Object.keys(schema),
        ],
        confirmations: input.confirmations,
      })
    );
  }
  await Promise.all(tablePromises);
  console.log(chalk.green(`Tables Registered`));
  return { tableIds, nonce: input.nonce };
}

// TODO: use TableId from utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toResourceSelector(namespace: string, file: string): Uint8Array {
  const namespaceBytes = toBytes16(namespace);
  const fileBytes = toBytes16(file);
  const result = new Uint8Array(32);
  result.set(namespaceBytes);
  result.set(fileBytes, 16);
  return result;
}

// TODO: use stringToBytes16 from utils as soon as utils are usable inside cli
// (see https://github.com/latticexyz/mud/issues/499)
function toBytes16(input: string) {
  if (input.length > 16) throw new Error("String does not fit into 16 bytes");

  const result = new Uint8Array(16);
  // Set ascii bytes
  for (let i = 0; i < input.length; i++) {
    result[i] = input.charCodeAt(i);
  }
  // Set the remaining bytes to 0
  for (let i = input.length; i < 16; i++) {
    result[i] = 0;
  }
  return result;
}
