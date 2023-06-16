import { NetworkConfig, SyncWorkerConfig, NetworkComponentUpdate, SystemCall } from "@latticexyz/network";
import { Schema, Components, Type, Component, Entity } from "@latticexyz/recs";
import { Contract } from "ethers";

export type SetupContractConfig = NetworkConfig &
  Omit<SyncWorkerConfig, "worldContract" | "mappings"> & {
    worldAddress: string;
    /**
     * @deprecated: use `disableCache` to disable the cache, use `fastTxExecutor` to send tx with 0 gas on dev chains
     */
    devMode?: boolean;
    disableCache?: boolean;
  };

export type DecodedNetworkComponentUpdate = Omit<Omit<NetworkComponentUpdate, "entity">, "component"> & {
  entity: Entity;
  component: Component<Schema>;
};

export type DecodedSystemCall<
  T extends { [key: string]: Contract } = { [key: string]: Contract },
  C extends Components = Components
> = Omit<SystemCall<C>, "updates"> & {
  systemId: keyof T;
  args: Record<string, unknown>;
  updates: DecodedNetworkComponentUpdate[];
};

export type ContractComponent = Component<Schema, { contractId: string; tableId?: string }>;

export type ContractComponents = {
  [key: string]: ContractComponent;
};

export type NetworkComponents<C extends ContractComponents> = C & {
  SystemsRegistry: Component<{ value: Type.String }>;
  ComponentsRegistry: Component<{ value: Type.String }>;
  LoadingState: Component<{
    state: Type.Number;
    msg: Type.String;
    percentage: Type.Number;
  }>;
};
