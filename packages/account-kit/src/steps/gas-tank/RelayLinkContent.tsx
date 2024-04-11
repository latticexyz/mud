import { useWalletClient } from "wagmi";
import { AccountModalContent } from "../../AccountModalContent";
import { useCallback, useEffect, useState } from "react";
import PaymasterSystemABI from "../../abis/PaymasterSystem.json";
import { Button } from "../../ui/Button";

import {
  getClient,
  createClient,
  convertViemChainToRelayChain,
  configureDynamicChains,
  TESTNET_RELAY_API,
  Execute,
  RelayChain,
} from "@reservoir0x/relay-sdk";
import { holesky } from "viem/chains";
import { createPublicClient, formatEther, http, parseEther } from "viem";

createClient({
  baseApiUrl: TESTNET_RELAY_API,
  source: window.location.hostname,
  chains: [convertViemChainToRelayChain(holesky)],
});

const CHAIN_FROM = 17000;
const CHAIN_TO = 17069;
const AMOUNT_STEP = 0.000000000000000001; // 1 wei
const PAYMASTER_ADDRESS = "0xba0149DE3486935D29b0e50DfCc9e61BD40Ae095";

// TODO: move to utils, or check if available already
const publicClient = createPublicClient({
  chain: holesky,
  transport: http(),
});

export function RelayLinkContent() {
  const wallet = useWalletClient();
  const [chains, setChains] = useState<RelayChain[]>([]);
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const [quote, setQuote] = useState<null | Execute>(null);
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
  const fetchQuote = useCallback(async () => {
    setQuote(null);
    if (!wallet.data || amount === BigInt(0)) return;

    const quote = await getClient()?.methods.getBridgeQuote({
      wallet: wallet.data,
      chainId: CHAIN_FROM, // The chain id to bridge from
      toChainId: CHAIN_TO, // The chain id to bridge to
      amount: amount.toString(), // Amount in wei to bridge
      currency: "eth", // `eth` | `usdc`
      recipient: wallet.data.account.address, // A valid address to send the funds to
    });

    // check if quote is objet
    if (quote instanceof Object) {
      setQuote(quote);
    }
  }, [amount, wallet.data]);

  const executeDeposit = useCallback(async () => {
    if (!wallet.data) return;

    const { request } = await publicClient.simulateContract({
      address: PAYMASTER_ADDRESS,
      abi: PaymasterSystemABI,
      functionName: "depositTo",
      args: [wallet.data.account.address],
      value: amount,
      account: wallet.data.account,
    });

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
  }, [amount, wallet.data]);

  const fetchChains = useCallback(async () => {
    const chains = await configureDynamicChains();
    setChains(chains);
  }, []);

  const handleAmountChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseEther(evt.target.value);
    setAmount(newAmount);
  };

  const handleSubmit = async () => {
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
            value={formatEther(amount)}
            onChange={handleAmountChange}
          />

          {quote && (
            <div className="mt-[15px]">
              <p>Time estimate: ~{quote?.breakdown?.[0]?.timeEstimate}s</p>
              <p>Deposit gas (Holesky): {formatEther(BigInt(quote?.fees?.gas || 0))} ETH</p>
              <p>Fill gas (Garnet): {formatEther(BigInt(quote?.fees?.relayerGas || 0))} ETH</p>
              <p>Relay fee: {formatEther(BigInt(quote?.fees?.relayerService || 0))} ETH</p>
            </div>
          )}
          {!quote && amount !== BigInt(0) && <p className="mt-[15px]">Fetching the best price ...</p>}

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
