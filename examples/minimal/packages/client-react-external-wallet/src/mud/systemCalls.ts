import { type WalletClient } from "viem";
import { type MUDNetwork } from "./NetworkContext";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export const increment = async (client: WalletClient, network: MUDNetwork) => {
  const { request } = await network.publicClient.simulateContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    functionName: "increment",
    args: [],
    account: client.account,
  });
  const tx = await client.writeContract(request);
  network.waitForTransaction(tx);
};
