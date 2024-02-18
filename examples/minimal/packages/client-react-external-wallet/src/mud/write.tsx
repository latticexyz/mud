import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Hex } from "viem";
import { useWalletClient, type WalletClient, type PublicClient, useNetwork } from "wagmi";
import { Subject, share } from "rxjs";
import { getContract, type ContractWrite } from "@latticexyz/common";
import { useMUDRead } from "./read";
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
  const { chain } = useNetwork();

  if (!(mudWrite && mudRead.publicClient.chain.id === chain?.id)) return null;

  return {
    worldContract: mudWrite.worldContract,
    write$: mudWrite.write$,
    walletClient: mudWrite.walletClient,
    systemCalls: createSystemCalls(mudRead, mudWrite),
  };
};

const getMudWrite = (address: Hex, publicClient: PublicClient, walletClient: WalletClient) => {
  const write$ = new Subject<ContractWrite>();

  const worldContract = getContract({
    address,
    abi: IWorldAbi,
    publicClient,
    walletClient,
    onWrite: (write) => write$.next(write),
  });

  return { worldContract, write$: write$.asObservable().pipe(share()), walletClient };
};
