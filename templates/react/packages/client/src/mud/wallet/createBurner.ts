import { createWalletClient, getContract, type Hex } from "viem";
import { Subject, share } from "rxjs";
import { type ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { callFrom } from "@latticexyz/world/internal";
import { createViemClientConfig } from "../createViemClientConfig";
import { getBurnerAccount } from "./getBurnerAccount";
import { type Network } from "../setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type Burner = ReturnType<typeof createBurner>;
export type WorldContract = Burner["worldContract"];

// Create a burner object including `walletClient` and `worldContract`.
//
// A burner account is a temporary account stored in local storage.
// This function checks its existence in storage; if absent, generates and saves the account.
//
// If `delegatorAddress` is provided, delegation is automatically applied to `walletClient.writeContract(world...)` and `worldContract.write()`.
export function createBurner(network: Network, delegatorAddress?: Hex) {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Get or create a burner account, and create a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  let walletClient = createWalletClient({
    ...createViemClientConfig(network.publicClient.chain),
    account: getBurnerAccount(),
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  if (delegatorAddress) {
    walletClient = walletClient.extend(
      callFrom({
        worldAddress: network.worldAddress,
        delegatorAddress,
        worldFunctionToSystemFunction: async (worldFunctionSelector) => {
          const systemFunction = network.useStore
            .getState()
            .getValue(network.tables.FunctionSelectors, { worldFunctionSelector });

          if (!systemFunction) throw new Error(`Possibly not synced: ${worldFunctionSelector}`);

          return { systemId: systemFunction.systemId, systemFunctionSelector: systemFunction.systemFunctionSelector };
        },
      }),
    );
  }

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: network.worldAddress,
    abi: IWorldAbi,
    client: { public: network.publicClient, wallet: walletClient },
  });

  return { walletClient, worldContract, write$: write$.asObservable().pipe(share()), delegatorAddress };
}
