import { Contracts, ContractsConfig } from "./types";
import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import { computed, IComputedValue } from "mobx";
import { mapObject } from "@latticexyz/utils";

export function createContracts<C extends Contracts>(
  config: ContractsConfig<C>,
  signerOrProvider: IComputedValue<Signer> | IComputedValue<Provider>
): IComputedValue<C> {
  return computed(() =>
    mapObject<ContractsConfig<C>, C>(
      config,
      ({ abi, address }) => new Contract(address, abi, signerOrProvider.get()) as C[keyof C]
    )
  );
}
