import { Contracts, ContractsConfig } from "./types";
import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import { computed, IComputedValue } from "mobx";
import { mapObject } from "@latticexyz/utils";

export async function createContracts<C extends Contracts>({
  config,
  asyncConfig,
  signerOrProvider,
}: {
  config: Partial<ContractsConfig<C>>;
  asyncConfig?: (contracts: C) => Promise<Partial<ContractsConfig<C>>>;
  signerOrProvider: IComputedValue<Signer | Provider>;
}): Promise<{ contracts: IComputedValue<C>; config: ContractsConfig<C> }> {
  const contracts = computed(() =>
    mapObject<Partial<ContractsConfig<C>>, C>(
      config,
      (c) => c && (new Contract(c.address, c.abi, signerOrProvider.get()) as C[keyof C])
    )
  );

  if (!asyncConfig) return { contracts, config: config as ContractsConfig<C> };

  const asyncConfigResult = await asyncConfig(contracts.get());

  const asyncContracts = computed(() =>
    mapObject<Partial<ContractsConfig<C>>, C>(
      asyncConfigResult,
      (c) => c && (new Contract(c.address, c.abi, signerOrProvider.get()) as C[keyof C])
    )
  );

  return {
    contracts: computed(() => ({ ...contracts.get(), ...asyncContracts.get() })),
    config: { ...config, ...asyncConfigResult } as ContractsConfig<C>,
  };
}
