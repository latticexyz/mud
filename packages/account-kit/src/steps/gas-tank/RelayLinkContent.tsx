import { useWalletClient } from "wagmi";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useState } from "react";
import PaymasterSystemABI from "../../abis/PaymasterSystem.json";
import { Button } from "../../ui/Button";

import { getClient, createClient, convertViemChainToRelayChain, TESTNET_RELAY_API } from "@reservoir0x/relay-sdk";
import { holesky } from "viem/chains";
import { createPublicClient, http, parseEther } from "viem";

createClient({
  baseApiUrl: TESTNET_RELAY_API,
  source: "YOUR.SOURCE", // TODO: set app URL as source
  chains: [convertViemChainToRelayChain(holesky)],
});

const CHAIN_FROM = 17000;
const CHAIN_TO = 17069;
const PAYMASTER_ADDRESS = "0xba0149DE3486935D29b0e50DfCc9e61BD40Ae095";

export function RelayLinkContent() {
  const wallet = useWalletClient();
  const [tx, setTx] = useState(null);

  // TODO: check solver capacity
  // const getSolver = async () => {
  //   const client = getClient();
  //   const { solver, enabled } = await client.methods.getSolverCapacity({
  //     originChainId: String(CHAIN_FROM), // The chain id to bridge from
  //     destinationChainId: String(CHAIN_TO), // The chain id to bridge to
  //     currency: zeroAddress,
  //   });

  //   console.log("solver:", solver);
  //   console.log("enabled:", enabled);

  //   return { solver, enabled };
  // };

  // TODO: show bridge quote to user
  // const getBridgeQuote = useCallback(async () => {
  //   const quote = await getClient()?.methods.getBridgeQuote({
  //     wallet: wallet.data,
  //     chainId: CHAIN_FROM, // The chain id to bridge from
  //     toChainId: CHAIN_TO, // The chain id to bridge to
  //     amount: "100000000000000", // Amount in wei to bridge
  //     currency: "eth", // `eth` | `usdc`
  //     recipient: zeroAddress, // A valid address to send the funds to
  //   });

  //   console.log("quote", quote);
  // }, [wallet.data]);

  const executeDeposit = useCallback(
    async (amount: string) => {
      if (!wallet.data) return;

      const publicClient = createPublicClient({
        chain: holesky,
        transport: http(),
      });

      const { request } = await publicClient.simulateContract({
        address: PAYMASTER_ADDRESS,
        abi: PaymasterSystemABI,
        functionName: "depositTo",
        args: [wallet.data.account.address],
        value: parseEther(amount),
        account: wallet.data.account,
      });

      console.log("depositTo request:", request);

      const client = getClient();
      const tx = await client.actions.call({
        chainId: CHAIN_FROM,
        toChainId: CHAIN_TO,
        txs: [request],
        wallet: wallet.data,
        onProgress: (data1, data2, data3, data4, data5) => {
          if (data5?.txHashes?.[0]) {
            const tx = data5.txHashes[0];
            setTx(`https://holesky.etherscan.io/tx/${tx.txHash}`);
          }
        },
      });

      console.log("tx", tx);
    },
    [wallet.data],
  );

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    const data = new FormData(evt.target);
    const amount = data.get("amount") as string;

    await executeDeposit(amount);
  };

  return (
    <AccountModalContent title="Relay.link balance top-up">
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          <h3>Chain from:</h3>
          <select>
            <option value="17000">Holesky</option>
          </select>
          <h3>Chain to:</h3>
          <select>
            <option value="17069">Garnet</option>
          </select>

          <h3>Amount to deposit:</h3>
          <input type="number" placeholder="Amount" name="amount" step={0.000001} />

          <div className="mt-[15px]">
            <Button type="submit">Deposit to Redstone gas tank</Button>
          </div>

          {tx && (
            <div className="mt-[15px]">
              <a href={tx} target="_blank" rel="noopener noreferrer" className="underline ">
                View transaction
              </a>
            </div>
          )}
        </form>
      </div>
    </AccountModalContent>
  );
}
