import { MUDUserConfig, parseWorldConfig, ResolvedWorldConfig, resolveWorldConfig } from "@latticexyz/cli";
import { abi as WorldAbi } from "@latticexyz/world/abi/World.json";
import { Contract, providers } from "ethers";

type TODO<T> = any;

type SystemsToCallStreams<Systems extends MUDUserConfig["overrideSystems"]> = Systems extends NonNullable<
  MUDUserConfig["overrideSystems"]
>
  ? {
      [K in keyof Systems]: Systems[K]["enableCallStream"] extends true ? TODO<K> : never;
    }
  : { [key: string]: never };

export function createV2SystemCallStreams<M extends MUDUserConfig>(
  mudConfig: M,
  worldAddress: string,
  provider: providers.Provider
): { callStreams: SystemsToCallStreams<M["overrideSystems"]> } {
  const parsedWorldConfig = resolveWorldConfig(parseWorldConfig(mudConfig));
  // TODO: move this to whatever we do to register systems
  const world = new Contract(worldAddress, WorldAbi, provider);

  const callStreams = {} as any;
  return { callStreams };
}
