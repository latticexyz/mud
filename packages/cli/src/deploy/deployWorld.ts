import { AbiEventSignatureNotFoundError, Account, Address, Chain, Client, Transport, decodeEventLog } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { ensureWorldFactory, worldFactory } from "./worldFactory";
import WorldFactoryAbi from "@latticexyz/world/out/WorldFactory.sol/WorldFactory.abi.json" assert { type: "json" };
import { isDefined } from "@latticexyz/common/utils";
import { writeContract } from "@latticexyz/common";

export async function deployWorld(client: Client<Transport, Chain | undefined, Account>): Promise<Address> {
  await ensureWorldFactory(client);

  const tx = await writeContract(client, {
    chain: client.chain ?? null,
    address: worldFactory,
    abi: WorldFactoryAbi,
    functionName: "deployWorld",
  });
  console.log("deployed world at tx", tx);
  const receipt = await waitForTransactionReceipt(client, { hash: tx });
  if (receipt.status !== "success") {
    console.error("world deploy failed", receipt);
    throw new Error("world deploy failed");
  }

  const logs = receipt.logs
    .map((log) => {
      try {
        return decodeEventLog({ abi: WorldFactoryAbi, topics: log.topics, data: log.data });
      } catch (error: unknown) {
        if (error instanceof AbiEventSignatureNotFoundError) {
          return;
        }
        throw error;
      }
    })
    .filter(isDefined);

  const deployEvent = logs.find((log) => log.eventName === "WorldDeployed");
  if (!deployEvent) {
    throw new Error("could not find WorldDeployed event");
  }

  return deployEvent.args.newContract;
}
