import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import { Contracts } from "./types";
import { Contract, ContractInterface, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

export type AddressAbi = {
  address: string;
  abi: ContractInterface;
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
  providerOrSigner$: Observable<Provider | Signer>
): ContractsStream<C> {
  const config$ = new BehaviorSubject<ContractsConfig<C>>(initialConfig);
  const contracts$ = combineLatest([providerOrSigner$, config$]).pipe(
    map(([providerOrSigner, config]) => {
      const contracts: Contracts = {};
      for (const [type, { address, abi }] of Object.entries(config)) {
        contracts[type] = new Contract(address, abi, providerOrSigner);
      }
      return contracts as C;
    })
  );

  return {
    config$,
    contracts$,
  };
}
