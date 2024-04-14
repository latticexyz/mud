import { useWalletClient } from "wagmi";
import { getClient, configureDynamicChains, Execute, RelayChain } from "@reservoir0x/relay-sdk";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useEffect, useState } from "react";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { Button } from "../../ui/Button";
import { createPublicClient, formatEther, http, parseEther } from "viem";
import { AMOUNT_STEP } from "./constants";
import { createRelayClient } from "./utils/createRelayClient";
import { holesky } from "viem/chains";
import { useConfig } from "../../MUDAccountKitProvider";

createRelayClient();

// TODO: move to utils, or check if available already
const publicClient = createPublicClient({
  chain: holesky,
  transport: http(),
});

export function RelayLinkContent() {
  const wallet = useWalletClient();
  const { chain, gasTankAddress } = useConfig();
  const [sourceChains, setSourceChains] = useState<RelayChain[]>([]);
  const [selectedSourceChainId, setSelectedSourceChainId] = useState<number>();
  const [amount, setAmount] = useState<string>("0.01");
  const [quote, setQuote] = useState<Execute | null>(null);
  const [tx, setTx] = useState<string | null>(null);

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
    if (!wallet.data || !amount || selectedSourceChainId == null) return;

    await wallet.data.switchChain({ id: selectedSourceChainId });

    const { request } = await publicClient.simulateContract({
      address: gasTankAddress,
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
  }, [amount, wallet.data, chain, selectedSourceChainId, gasTankAddress]);

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
    <AccountModalContent>
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          <h3>Chain from:</h3>
          <select value={selectedSourceChainId} onChange={(e) => setSelectedSourceChainId(Number(e.target.value))}>
            {sourceChains.map((sourceChain) => (
              <option key={sourceChain.id} value={sourceChain.id}>
                {sourceChain.name}
              </option>
            ))}
          </select>
          <h3>Chain to:</h3>
          <select>
            <option value={chain.id}>Garnet</option>
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

          {quote && (
            <div className="mt-[15px]">
              <p>Time estimate: ~{quote?.breakdown?.[0]?.timeEstimate}s</p>
              <p>Deposit gas (Holesky): {formatEther(BigInt(quote?.fees?.gas || 0))} ETH</p>
              <p>Fill gas (Garnet): {formatEther(BigInt(quote?.fees?.relayerGas || 0))} ETH</p>
              <p>Relay fee: {formatEther(BigInt(quote?.fees?.relayerService || 0))} ETH</p>
            </div>
          )}
          {!quote && amount && <p className="mt-[15px]">Fetching the best price ...</p>}

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
