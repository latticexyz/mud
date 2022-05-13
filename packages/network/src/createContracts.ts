import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import * as ethers from "ethers";
import { Contracts } from "./types";

export type AddressAbi = {
  address: string;
  abi: ethers.ContractInterface;
};

export type ContractsStream<C extends Contracts> = {
  config$: Subject<ContractsConfig<C>>;
  contracts$: Observable<C>;
};

export type ContractsConfig<C extends Contracts> = {
  [ContractType in keyof C]: AddressAbi;
};

export function createContracts<C extends Contracts>(
  initialConfig: ContractsConfig<C>,
  providerOrSigner$: Observable<ethers.providers.Provider | ethers.Signer>
): ContractsStream<C> {
  const config$ = new BehaviorSubject<ContractsConfig<C>>(initialConfig);
  const contracts$ = combineLatest([providerOrSigner$, config$]).pipe(
    map(([providerOrSigner, config]) => {
      const contracts: Contracts = {};
      for (const [type, { address, abi }] of Object.entries(config)) {
        contracts[type] = new ethers.Contract(address, abi, providerOrSigner);
      }
      return contracts as C;
    })
  );

  return {
    config$,
    contracts$,
  };
}
