import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useWriteContract, useConfig as useWagmiConfig, useAccount, useWalletClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { AccountModalContent } from "../../AccountModalContent";
import { Button } from "../../ui/Button";
import { useConfig } from "../../MUDAccountKitProvider";
import { getGasTankBalanceQueryKey, useGasTankBalance } from "../../useGasTankBalance";
import OptimismPortalAbi from "../../abis/OptimismPortal.json";
import PaymasterSystemAbi from "../../abis/PaymasterSystem.json";

const CHAIN_FROM = 17000;
const CHAIN_TO = 17069;
const AMOUNT_STEP = 0.000000000000000001; // 1 wei
const PAYMASTER_ADDRESS = "0xba0149DE3486935D29b0e50DfCc9e61BD40Ae095"; // Garnet
const OPTIMISM_PORTAL_ADDRESS = "0x57ee40586fbE286AfC75E67cb69511A6D9aF5909"; // Holesky

export function StandardBridgeContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chainId, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const wallet = useWalletClient();
  const gasTankBalance = useGasTankBalance();
  console.log("gasTankBalance", gasTankBalance);

  const [tx, setTx] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | undefined>("0.01");
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        setTx(`https://holesky.etherscan.io/tx/${hash}`);
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        console.log("receipt", receipt);

        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId, gasTankAddress, userAccountAddress }),
          });
        }
      },
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!userAccountAddress || !amount || Number(amount) === 0) return;

    const gasLimit = BigInt(1_000_000); // TODO: better gas limit config
    const data = encodeFunctionData({
      abi: PaymasterSystemAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    });
    const amountWei = parseEther(amount);

    console.log("amountWei", amountWei);

    await writeContractAsync({
      account: wallet?.data?.account,
      chainId: 17000,
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
            <option value={CHAIN_FROM}>Holesky</option>
          </select>
          <h3>Chain to:</h3>
          <select>
            <option value={CHAIN_TO}>Garnet</option>
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
