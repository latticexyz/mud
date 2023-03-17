import { SystemCall } from "@latticexyz/network";
import { Components, World, Type, EntityID, getComponentValue, Component } from "@latticexyz/recs";
import { Contract, BigNumber } from "ethers";
import toLower from "lodash/toLower";
import compact from "lodash/compact";
import { Subject } from "rxjs";
import { DecodedSystemCall } from "./types";
import { createDecodeNetworkComponentUpdate } from "./utils";

export function createSystemCallStreams<C extends Components, SystemTypes extends { [key: string]: Contract }>(
  world: World,
  systemNames: string[],
  systemsRegistry: Component<{ value: Type.String }>,
  getSystemContract: (systemId: string) => { name: string; contract: Contract },
  decodeNetworkComponentUpdate: ReturnType<typeof createDecodeNetworkComponentUpdate>
) {
  const systemCallStreams = systemNames.reduce(
    (streams, systemId) => ({ ...streams, [systemId]: new Subject<DecodedSystemCall<SystemTypes>>() }),
    {} as Record<string, Subject<DecodedSystemCall<SystemTypes, C>>>
  );

  console.log("systemCallStreams", systemCallStreams);

  return {
    systemCallStreams,
    decodeAndEmitSystemCall: (systemCall: SystemCall<C>) => {
      const { tx } = systemCall;

      const systemEntityIndex = world.entityToIndex.get(toLower(BigNumber.from(tx.to).toHexString()) as EntityID);
      if (!systemEntityIndex) return;

      const hashedSystemId = getComponentValue(systemsRegistry, systemEntityIndex)?.value;
      if (!hashedSystemId) return;

      const { name, contract } = getSystemContract(hashedSystemId);

      const decodedTx = contract.interface.parseTransaction({ data: tx.data, value: tx.value });

      // If this is a newly registered System make a new Subject
      if (!systemCallStreams[name]) {
        systemCallStreams[name] = new Subject<DecodedSystemCall<SystemTypes>>();
      }

      systemCallStreams[name].next({
        ...systemCall,
        updates: compact(systemCall.updates.map(decodeNetworkComponentUpdate)),
        systemId: name,
        args: decodedTx.args,
      });
    },
  };
}
