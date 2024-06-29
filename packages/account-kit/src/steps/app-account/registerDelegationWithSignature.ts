import { resourceToHex } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { Account, Chain, Client, Hex, Transport, encodeFunctionData } from "viem";
import { writeContract } from "viem/actions";
import { unlimitedDelegationControlId } from "../../common";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import { getAction } from "viem/utils";

export async function registerDelegationWithSignature({
  worldAddress,
  appAccountClient,
  userAddress,
  signature,
}: {
  worldAddress: Hex;
  appAccountClient: Client<Transport, Chain, Account>;
  userAddress: Hex;
  signature: Hex;
}) {
  console.log("calling registerDelegation");
  return await getAction(
    appAccountClient,
    writeContract,
    "writeContract",
  )({
    address: worldAddress,
    abi: CallWithSignatureAbi,
    functionName: "callWithSignature",
    account: appAccountClient.account,
    chain: appAccountClient.chain,
    args: [
      userAddress,
      resourceToHex({ type: "system", namespace: "", name: "Registration" }),
      encodeFunctionData({
        abi: IBaseWorldAbi,
        functionName: "registerDelegation",
        args: [appAccountClient.account.address, unlimitedDelegationControlId, "0x"],
      }),
      signature,
    ],
  });
}
