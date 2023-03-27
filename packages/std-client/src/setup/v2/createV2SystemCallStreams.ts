import { MUDUserConfig, parseWorldConfig, resolveWorldConfig } from "@latticexyz/cli";
import { NetworkComponentUpdate, SystemCall } from "@latticexyz/network";
import { StoreUserConfigToComponents } from "@latticexyz/recs";
import { bytesToString, hexToArray, TableId } from "@latticexyz/utils";
import { abi as WorldAbi } from "@latticexyz/world/abi/World.json";
import { Contract, providers } from "ethers";
import { Subject } from "rxjs";

type SystemsToCallStreams<Config extends MUDUserConfig> = Config["overrideSystems"] extends undefined
  ? undefined
  : {
      // TODO: pass through total components, not just store components from config
      [K in keyof Config["overrideSystems"]]: Subject<SystemCall<StoreUserConfigToComponents<Config>>>;
    };

export function createV2SystemCallStreams<Config extends MUDUserConfig>(
  mudConfig: Config,
  worldAddress: string,
  provider: providers.Provider
): {
  callStreams: SystemsToCallStreams<Config>;
  decodeAndEmitSystemCall: (systemCall: SystemCall) => void;
} {
  const config = resolveWorldConfig(parseWorldConfig(mudConfig));
  // TODO: move this to whatever we do to register systems
  const world = new Contract(worldAddress, WorldAbi, provider);

  console.log("got v2 systems", config.namespace, config.systems);

  let callStreams = {} as SystemsToCallStreams<Config>;

  if (mudConfig.overrideSystems) {
    callStreams = {} as NonNullable<SystemsToCallStreams<Config>>;
    for (const [systemName, systemConfig] of Object.entries(mudConfig.overrideSystems)) {
      const key = systemName as keyof Config["overrideSystems"];
      callStreams[key] = new Subject<SystemCall<StoreUserConfigToComponents<Config>>>();
    }
  }

  return {
    callStreams,
    decodeAndEmitSystemCall: (systemCall: SystemCall) => {
      if (!mudConfig.overrideSystems) return;
      if (!callStreams) return;

      const parsedTx = world.interface.parseTransaction(systemCall.tx);

      // TODO: move this to a util
      const namespace = hexToArray(parsedTx.args.namespace);
      const file = hexToArray(parsedTx.args.file);
      const bytes32 = new Uint8Array(32);
      bytes32.set(namespace);
      bytes32.set(file, 16);

      const resourceId = TableId.fromBytes32(bytes32);

      for (const [systemName, systemConfig] of Object.entries(config.systems)) {
        const systemResourceId = new TableId(config.namespace, systemConfig.fileSelector);
        if (systemResourceId.toHexString() === resourceId.toHexString()) {
          if (callStreams[systemName]) {
            callStreams[systemName].next(systemCall);
          }
        }
      }
    },
  };
}
