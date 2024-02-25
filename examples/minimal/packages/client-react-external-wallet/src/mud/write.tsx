import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  getContract,
  type Hex,
  type WriteContractParameters,
  type Chain,
  type Account,
  type WalletActions,
} from "viem";
import { sendTransaction, writeContract } from "viem/actions";
import { useWalletClient, useAccount, type UseWalletClientReturnType } from "wagmi";
import { Subject, share } from "rxjs";
import pRetry from "p-retry";
import { getNonceManager, type ContractWrite } from "@latticexyz/common";
import { type MUDRead, useMUDRead } from "./read";
import { createSystemCalls } from "./createSystemCalls";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type MUDWrite = ReturnType<typeof getMudWrite>;

const MUDWriteContext = createContext<MUDWrite | null>(null);

export const MUDWriteProvider = (props: { children: ReactNode }) => {
  if (useContext(MUDWriteContext)) throw new Error("MUDWriteProvider can only be used once");

  const { worldAddress, publicClient } = useMUDRead();
  const { data: walletClient } = useWalletClient();

  const [mudWrite, setMudWrite] = useState<MUDWrite | null>(null);

  useEffect(() => {
    if (!walletClient) return;
    setMudWrite(getMudWrite(worldAddress, publicClient, walletClient));
    return () => setMudWrite(null);
  }, [walletClient?.account.address]);

  return <MUDWriteContext.Provider value={mudWrite}>{props.children}</MUDWriteContext.Provider>;
};

export const useMUDWrite = () => {
  const mudWrite = useContext(MUDWriteContext);
  const mudRead = useMUDRead();
  const { chainId } = useAccount();

  if (!(mudWrite && mudRead.publicClient.chain.id === chainId)) return null;

  return {
    worldContract: mudWrite.worldContract,
    write$: mudWrite.write$,
    walletClient: mudWrite.walletClient,
    systemCalls: createSystemCalls(mudRead, mudWrite),
  };
};

type WalletClient = NonNullable<UseWalletClientReturnType["data"]>;

const getMudWrite = (address: Hex, publicClient: MUDRead["publicClient"], walletClient: WalletClient) => {
  // `walletClient.extend(burnerActions)` is unnecessary for an external wallet
  const { client, write$ } = setupWriteContractObserver(walletClient);

  const worldContract = getContract({
    address,
    abi: IWorldAbi,
    client: { public: publicClient, wallet: client },
  });

  return { worldContract, write$, walletClient: client };
};

// See @latticexyz/common/src/sendTransaction.ts
function burnerActions<TChain extends Chain, TAccount extends Account>(
  walletClient: WalletClient
): Pick<WalletActions<TChain, TAccount>, "sendTransaction"> {
  const debug: typeof console.log = () => {}; // or `debug = console.log`

  return {
    sendTransaction: async (args) => {
      const nonceManager = await getNonceManager({
        client: walletClient,
        address: walletClient.account.address,
        blockTag: "pending",
      });

      return nonceManager.mempoolQueue.add(
        () =>
          pRetry(
            async () => {
              if (!nonceManager.hasNonce()) {
                await nonceManager.resetNonce();
              }

              const nonce = nonceManager.nextNonce();
              debug("sending tx with nonce", nonce, "to", args.to);
              return sendTransaction(walletClient, { ...args, nonce } as typeof args);
            },
            {
              retries: 3,
              onFailedAttempt: async (error) => {
                // On nonce errors, reset the nonce and retry
                if (nonceManager.shouldResetNonce(error)) {
                  debug("got nonce error, retrying", error.message);
                  await nonceManager.resetNonce();
                  return;
                }
                // TODO: prepare again if there are gas errors?
                throw error;
              },
            }
          ),
        { throwOnTimeout: true }
      );
    },
  };
}

// See @latticexyz/common/src/getContract.ts
const setupWriteContractObserver = (walletClient: WalletClient) => {
  const write$ = new Subject<ContractWrite>();
  const onWrite = (write: ContractWrite) => write$.next(write);
  let nextWriteId = 0;

  const extended = walletClient.extend((client) => ({
    writeContract: async (args) => {
      const result = writeContract(client, args);

      const id = `${walletClient.chain.id}:${walletClient.account.address}:${nextWriteId++}`;
      onWrite({ id, request: args as WriteContractParameters, result });

      return result;
    },
  }));

  return { client: extended, write$: write$.asObservable().pipe(share()) };
};
