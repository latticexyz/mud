import { createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Subject, share } from "rxjs";
import { getBurnerPrivateKey, type ContractWrite } from "@latticexyz/common";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { type MUDChain } from "@latticexyz/common/chains";
import { type Burner } from "./BurnerContext";
import { createClientConfig } from "../createClientConfig";

export function createBurner(chain: MUDChain): Burner {
  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  const walletClient = createWalletClient({
    ...createClientConfig(chain),
    account: privateKeyToAccount(getBurnerPrivateKey()),
  })
    .extend(transactionQueue())
    .extend(writeObserver({ onWrite: (write) => write$.next(write) }));

  return { walletClient, write$: write$.asObservable().pipe(share()) };
}
