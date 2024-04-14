import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useWriteContract, useConfig as useWagmiConfig, useAccount, useWalletClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { AccountModalContent } from "../../AccountModalContent";
import { Button } from "../../ui/Button";
import { useConfig } from "../../MUDAccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import OptimismPortalAbi from "../../abis/OptimismPortal.json";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { AMOUNT_STEP, OPTIMISM_PORTAL_ADDRESS } from "./constants";
import { getExplorerUrl } from "./utils/getExplorerUrl";

export function StandardBridgeContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const wallet = useWalletClient();
  const { chain, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  if (chain.sourceId == null) {
    throw new Error("No source chain available for " + chain.name);
  }

  const [tx, setTx] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | undefined>("0.01");
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        setTx(getExplorerUrl(hash, chain.sourceId!));

        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress }),
          });
        }
      },
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (!wallet.data || !userAccountAddress || !amount || Number(amount) === 0) return;

    await wallet.data.switchChain({ id: chain.sourceId! });

    const gasLimit = BigInt(1_000_000); // TODO: better gas limit config
    const amountWei = parseEther(amount);
    const data = encodeFunctionData({
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    });

    await writeContractAsync({
      account: wallet.data.account,
      chainId: chain.sourceId,
      address: OPTIMISM_PORTAL_ADDRESS,
      abi: OptimismPortalAbi,
      functionName: "depositTransaction",
      args: [gasTankAddress, amountWei, gasLimit, false, data],
      value: amountWei,
    });
  };

  return (
    <AccountModalContent>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          <h3>Chain from:</h3>
          <select>
            <option value={chain.sourceId}>L1</option>
          </select>
          <h3>Chain to:</h3>
          <select>
            <option value={chain.id}>L2</option>
          </select>

          <h3>Amount to deposit:</h3>
          <input
            type="number"
            placeholder="Amount"
            name="amount"
            step={AMOUNT_STEP}
            value={amount}
            onChange={(evt) => setAmount(evt.target.value)}
          />

          <div className="mt-[15px]">
            <Button type="submit">Bridge to Redstone gas tank</Button>
          </div>

          {tx && (
            <div className="mt-[15px]">
              <a href={tx} target="_blank" rel="noopener noreferrer" className="underline">
                View transaction
              </a>
            </div>
          )}
        </form>
      </div>
    </AccountModalContent>
  );
}
