import { Observable } from "rxjs";
import { createNetwork } from "./createNetwork";
import { createProvider } from "./createProvider";

export interface NetworkConfig {
  chainId: number;
  privateKey?: string;
  clock: ClockConfig;
  provider: ProviderConfig;
}

export interface ClockConfig {
  period: number;
  initialTime: number;
}

export type Clock = {
  time$: Observable<number>;
  currentTime: number;
  lastUpdateTime: number;
  update: (time: number, maintainStale?: boolean) => void;
  dispose: () => void;
};

export interface ProviderConfig {
  jsonRpcUrl: string;
  wsRpcUrl?: string;
  options?: { batch?: boolean; pollingInterval?: number; skipNetworkCheck?: boolean };
}

export type Providers = ReturnType<typeof createProvider>;
export type Network = ReturnType<typeof createNetwork>;
