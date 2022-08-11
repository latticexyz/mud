import { JsonRpcProvider } from "@ethersproject/providers";
import { EntityID, ComponentValue } from "@latticexyz/recs";
import { to256BitString, awaitPromise, range } from "@latticexyz/utils";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { BytesLike, Contract, BigNumber } from "ethers";
import { Observable, map, concatMap, of } from "rxjs";
import { createDecoder } from "../createDecoder";
import { createTopics } from "../createTopics";
import { fetchEventsInBlockRange } from "../networkUtils";
import { ECSStateSnapshotServiceClient } from "../protogen/ecs-snapshot.client";
import { NetworkComponentUpdate, ContractConfig } from "../types";
import { CacheStore, createCacheStore, storeEvent } from "./CacheStore";
import { abi as ComponentAbi } from "@latticexyz/solecs/abi/Component.json";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";
import { Component, World } from "@latticexyz/solecs/types/ethers-contracts";

// Create a ECSStateSnapshotServiceClient
export function createSnapshotClient(url: string): ECSStateSnapshotServiceClient {
  const transport = new GrpcWebFetchTransport({ baseUrl: url, format: "binary" });
  return new ECSStateSnapshotServiceClient(transport);
}

// Return the snapshot block number
export async function getSnapshotBlockNumber(
  snapshotClient: ECSStateSnapshotServiceClient | undefined,
  worldAddress: string
): Promise<number> {
  if (!snapshotClient) return -1;
  const {
    response: { blockNumber },
  } = await snapshotClient.getStateBlockLatest({ worldAddress });
  return blockNumber;
}

// Load from remote snapshot service
export async function fetchSnapshot(
  snapshotClient: ECSStateSnapshotServiceClient,
  worldAddress: string,
  decode: ReturnType<typeof createDecode>
): Promise<CacheStore> {
  const cacheStore = createCacheStore();

  const {
    response: { state, blockNumber, stateComponents, stateEntities },
  } = await snapshotClient.getStateLatest({ worldAddress });

  for (const { componentIdIdx, entityIdIdx, value: rawValue } of state) {
    const component = to256BitString(stateComponents[componentIdIdx]);
    const entity = stateEntities[entityIdIdx] as EntityID;
    const value = await decode(component, rawValue);
    storeEvent(cacheStore, { component, entity, value, blockNumber });
  }
  return cacheStore;
}

// Use streaming service if available, otherwise fetch events from RPC
export function createLatestEventStream(
  blockNumber$: Observable<number>,
  fetchWorldEvents: ReturnType<typeof createFetchWorldEventsInBlockRange>
): Observable<NetworkComponentUpdate> {
  let lastSyncedBlockNumber: number | undefined;

  return blockNumber$.pipe(
    map((blockNumber) => {
      const from =
        lastSyncedBlockNumber == null || lastSyncedBlockNumber >= blockNumber ? blockNumber : lastSyncedBlockNumber + 1;
      const to = blockNumber;
      lastSyncedBlockNumber = to;
      return fetchWorldEvents(from, to);
    }),
    awaitPromise(),
    concatMap((v) => of(...v))
  );
}

// Fetch events in blocks between fromBlockNumber to toBlockNumber (can be replaced by own service in the future)
export async function fetchStateInBlockRange(
  fetchWorldEvents: ReturnType<typeof createFetchWorldEventsInBlockRange>,
  fromBlockNumber: number,
  toBlockNumber: number,
  interval = 50
): Promise<CacheStore> {
  const cacheStore = createCacheStore();
  const delta = toBlockNumber - fromBlockNumber;
  const numSteps = Math.ceil(delta / interval);
  const steps = [...range(numSteps, interval, fromBlockNumber)];

  for (let i = 0; i < steps.length; i++) {
    const from = steps[i];
    const to = i === steps.length - 1 ? toBlockNumber : steps[i + 1] - 1;
    const events = await fetchWorldEvents(from, to);

    for (const event of events) {
      storeEvent(cacheStore, event);
    }
  }

  return cacheStore;
}

// Creates a function to decode raw component values
export function createDecode(worldConfig: ContractConfig, provider: JsonRpcProvider) {
  const decoders: { [key: string]: (data: BytesLike) => ComponentValue } = {};
  const world = new Contract(worldConfig.address, worldConfig.abi, provider) as World;

  async function decode(componentId: string, data: BytesLike, componentAddress?: string): Promise<ComponentValue> {
    // Create the decoder if it doesn't exist yet
    if (!decoders[componentId]) {
      const address = componentAddress || (await world.getComponent(componentId));
      console.log("Creating decoder for", address);
      const component = new Contract(address, ComponentAbi, provider) as Component;
      const [keys, values] = await component.getSchema();
      decoders[componentId] = createDecoder(keys, values);
    }

    // Decode the raw value
    return decoders[componentId](data);
  }

  return decode;
}

// Create world contract event topics
export function createWorldTopics() {
  return createTopics<{ World: World }>({
    World: { abi: WorldAbi, topics: ["ComponentValueSet", "ComponentValueRemoved"] },
  });
}

// Generator function for fetchWorldEventsInBlockRange
export function createFetchWorldEventsInBlockRange(
  provider: JsonRpcProvider,
  worldConfig: ContractConfig,
  batch: boolean | undefined,
  decode: ReturnType<typeof createDecode>
) {
  const topics = createWorldTopics();

  // Fetches World events in the provided block range (including from and to)
  return async (from: number, to: number) => {
    const contractsEvents = await fetchEventsInBlockRange(provider, topics, from, to, { World: worldConfig }, batch);
    const ecsEvents: NetworkComponentUpdate[] = [];

    for (const event of contractsEvents) {
      const { lastEventInTx, txHash, args } = event;
      const {
        component: address,
        entity: entityId,
        data,
        componentId: rawComponentId,
      } = args as unknown as {
        component: string;
        entity: BigNumber;
        data: string;
        componentId: BigNumber;
      };

      const component = to256BitString(BigNumber.from(rawComponentId).toHexString());
      const entity = to256BitString(BigNumber.from(entityId).toHexString()) as EntityID;
      const blockNumber = to;

      const ecsEvent = {
        component,
        entity,
        value: undefined,
        blockNumber,
        lastEventInTx,
        txHash,
      };

      if (event.eventKey === "ComponentValueRemoved") {
        ecsEvents.push(ecsEvent);
      }

      if (event.eventKey === "ComponentValueSet") {
        const value = await decode(component, data, address);
        ecsEvents.push({ ...ecsEvent, value });
      }
    }

    return ecsEvents;
  };
}
