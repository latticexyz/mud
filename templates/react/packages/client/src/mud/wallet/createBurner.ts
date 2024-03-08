import { createWalletClient, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Subject, share } from "rxjs";
import { getBurnerPrivateKey, type ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { createClientConfig } from "../createClientConfig";
import { type Network } from "../setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type Burner = ReturnType<typeof createBurner>;

export function createBurner(network: Network) {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  const walletClient = createWalletClient({
    ...createClientConfig(network.publicClient.chain),
    account: privateKeyToAccount(getBurnerPrivateKey()),
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    client: { public: network.publicClient, wallet: walletClient },
  });

  return { walletClient, worldContract, write$: write$.asObservable().pipe(share()) };
}
