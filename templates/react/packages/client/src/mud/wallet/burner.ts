import { createWalletClient, getContract, type Hex } from "viem";
import { privateKeyToAccount, privateKeyToAddress } from "viem/accounts";
import { Subject, share } from "rxjs";
import { getBurnerPrivateKey, type ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { createClientConfig } from "../createClientConfig";
import { callFrom } from "./callFrom";
import { type Network } from "../setupNetwork";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";

export type Burner = ReturnType<typeof createBurner>;
export type WorldContract = Burner["worldContract"];

export function createBurner(network: Network, externalWalletAccountAddress?: Hex) {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Create a temporary wallet and a viem client for it
   * (see https://viem.sh/docs/clients/wallet.html).
   */
  let walletClient = createWalletClient({
    ...createClientConfig(network.publicClient.chain),
    account: privateKeyToAccount(getBurnerPrivateKey()),
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  if (externalWalletAccountAddress) {
    walletClient = walletClient.extend(
      callFrom({
        worldAddress: network.worldAddress,
        delegatorAddress: externalWalletAccountAddress,
        worldFunctionToSystemFunction: async (worldFunctionSelector) => {
          const systemFunction = network.useStore
            .getState()
            .getValue(network.tables.FunctionSelectors, { worldFunctionSelector })!;

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

  return { walletClient, worldContract, write$: write$.asObservable().pipe(share()) };
}

export function getBurnerAddress() {
  return privateKeyToAddress(getBurnerPrivateKey());
}
