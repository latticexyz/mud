import { useWalletClient } from "wagmi";
import { getClient, configureDynamicChains, Execute, RelayChain } from "@reservoir0x/relay-sdk";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useEffect, useState } from "react";
import PaymasterSystemAbi from "../../abis/PaymasterSystem.json";
import { Button } from "../../ui/Button";
import { holesky } from "viem/chains";
import { createPublicClient, formatEther, http, parseEther } from "viem";
import { CHAIN_FROM, CHAIN_TO, AMOUNT_STEP, PAYMASTER_ADDRESS } from "./consts";
import { createRelayCLient } from "./utils/createRelayClient";

createRelayCLient();

// TODO: move to utils, or check if available already
const publicClient = createPublicClient({
  chain: holesky,
  transport: http(),
});

export function RelayLinkContent() {
  const wallet = useWalletClient();
  const [chains, setChains] = useState<RelayChain[]>([]);
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
    const chains = await configureDynamicChains();
    setChains(chains);
  }, []);

  const fetchQuote = useCallback(async () => {
    setQuote(null);
    if (!wallet.data || !amount) return;

    const quote = await getClient()?.methods.getBridgeQuote({
      wallet: wallet.data,
      chainId: CHAIN_FROM, // The chain id to bridge from
      toChainId: CHAIN_TO, // The chain id to bridge to
      amount: parseEther(amount).toString(), // Amount in wei to bridge
      currency: "eth", // `eth` | `usdc`
      recipient: wallet.data.account.address, // A valid address to send the funds to
    });

    // check if quote is objet
    if (quote instanceof Object) {
      setQuote(quote);
    }
  }, [amount, wallet.data]);

  const executeDeposit = useCallback(async () => {
    if (!wallet.data || !amount) return;

    // TODO: make source chain configurable
    await wallet.data.switchChain({ id: holesky.id });

    const { request } = await publicClient.simulateContract({
      address: PAYMASTER_ADDRESS,
      abi: PaymasterSystemAbi,
      functionName: "depositTo",
      args: [wallet.data.account.address],
      value: parseEther(amount),
      account: wallet.data.account,
    });

    const client = getClient();
    await client.actions.call({
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
  }, [amount, wallet.data]);

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
    <AccountModalContent title="Relay.link balance top-up">
      <div className="flex flex-col gap-2">
        <form onSubmit={handleSubmit}>
          <h3>Chain from:</h3>
          <select>
            <option value={CHAIN_FROM}>Holesky</option>
            {chains.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
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
