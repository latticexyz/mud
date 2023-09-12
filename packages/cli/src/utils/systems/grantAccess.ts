import chalk from "chalk";
import { Contract } from "ethers";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { tableIdToHex } from "@latticexyz/common";
import { TxConfig, fastTxExecute } from "../txHelpers";
import { SystemsConfig } from "./types";

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
