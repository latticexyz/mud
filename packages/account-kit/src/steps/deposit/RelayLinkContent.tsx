import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getClient, configureDynamicChains, Execute, RelayChain } from "@reservoir0x/relay-sdk";
import { useCallback, useEffect, useState } from "react";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { Button } from "../../ui/Button";
import { parseEther } from "viem";
import { createRelayClient } from "./utils/createRelayClient";
import { useConfig } from "../../AccountKitConfigProvider";
import { usePaymaster } from "../../usePaymaster";

createRelayClient();

type RelayLinkContentProps = {
  amount: string;
};

export function RelayLinkContent({ amount }: RelayLinkContentProps) {
  const wallet = useWalletClient();
  const { chain } = useConfig();
  const gasTank = usePaymaster("gasTank");
  const userAccount = useAccount();
  const userAccountChainId = userAccount?.chain?.id;
  const publicClient = usePublicClient({
    chainId: userAccountChainId,
  });
  const [, setSourceChains] = useState<RelayChain[]>([]);
  const [selectedSourceChainId] = useState<number>();
  const [, setQuote] = useState<Execute | null>(null);
  const [tx, setTx] = useState<string | null>(null);

  const fetchChains = useCallback(async () => {
    const sourceChains = await configureDynamicChains();
    setSourceChains(sourceChains);
  }, []);

  const fetchQuote = useCallback(async () => {
    setQuote(null);
    if (!wallet.data || !amount || selectedSourceChainId == null) return;

    const quote = await getClient()?.methods.getBridgeQuote({
      wallet: wallet.data,
      chainId: selectedSourceChainId, // The chain id to bridge from
      toChainId: chain.id, // The chain id to bridge to
      amount: parseEther(amount).toString(), // Amount in wei to bridge
      currency: "eth", // `eth` | `usdc`
      recipient: wallet.data.account.address, // A valid address to send the funds to
    });

    // check if quote is objet
    if (quote instanceof Object) {
      setQuote(quote);
    }
  }, [amount, wallet.data, chain, selectedSourceChainId]);

  const executeDeposit = useCallback(async () => {
    if (!wallet.data || !amount || selectedSourceChainId == null || !publicClient || !gasTank) return;

    await wallet.data.switchChain({ id: selectedSourceChainId });

    const { request } = await publicClient.simulateContract({
      address: gasTank.address,
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [wallet.data.account.address],
      value: parseEther(amount),
      account: wallet.data.account,
    });

    const client = getClient();
    await client.actions.call({
      chainId: selectedSourceChainId,
      toChainId: chain.id,
      txs: [request],
      wallet: wallet.data,
      onProgress: (data1, data2, data3, data4, data5) => {
        if (data5?.txHashes?.[0]) {
          const tx = data5.txHashes[0];
          setTx(`https://holesky.etherscan.io/tx/${tx.txHash}`);
        }
      },
    });
  }, [wallet.data, amount, selectedSourceChainId, publicClient, gasTank, chain.id]);

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    await executeDeposit();
  };

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          {/* <select value={selectedSourceChainId} onChange={(e) => setSelectedSourceChainId(Number(e.target.value))}>
            {sourceChains.map((sourceChain) => (
              <option key={sourceChain.id} value={sourceChain.id}>
                {sourceChain.name}
              </option>
            ))}
          </select> */}

          <div className="mt-[15px]">
            <Button type="submit">Deposit</Button>
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
    </>
  );
}
