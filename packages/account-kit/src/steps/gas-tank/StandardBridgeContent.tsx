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
import PaymasterSystemAbi from "../../abis/PaymasterSystem.json";
import { AMOUNT_STEP, OPTIMISM_PORTAL_ADDRESS, PAYMASTER_ADDRESS } from "./consts";
import { holesky } from "viem/chains";
import { getExplorerUrl } from "./utils/getExplorerUrl";

export function StandardBridgeContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const wallet = useWalletClient();
  const { chainId: appChainId, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const [tx, setTx] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | undefined>("0.01");
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        setTx(getExplorerUrl(hash, holesky.id));

        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: appChainId, gasTankAddress, userAccountAddress }),
          });
        }
      },
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (!wallet.data || !userAccountAddress || !amount || Number(amount) === 0) return;

    // TODO: make source chain configurable
    await wallet.data.switchChain({ id: holesky.id });

    const gasLimit = BigInt(1_000_000); // TODO: better gas limit config
    const amountWei = parseEther(amount);
    const data = encodeFunctionData({
      abi: PaymasterSystemAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    });

    await writeContractAsync({
      account: wallet.data.account,
      chainId: holesky.id,
      address: OPTIMISM_PORTAL_ADDRESS,
      abi: OptimismPortalAbi,
      functionName: "depositTransaction",
      args: [PAYMASTER_ADDRESS, amountWei, gasLimit, false, data],
      value: amountWei,
    });
  };

  return (
    <AccountModalContent title="Bridge balance top-up">
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          <h3>Chain from:</h3>
          <select>
            <option value={holesky.id}>Holesky</option>
          </select>
          <h3>Chain to:</h3>
          <select>
            <option value={appChainId}>Garnet</option>
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
