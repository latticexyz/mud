import { to256BitString, awaitPromise, range, Uint8ArrayToHexString } from "@latticexyz/utils";
import { BytesLike, Contract, BigNumber } from "ethers";
import { Observable, map, concatMap, of, from } from "rxjs";
import { createDecoder } from "../createDecoder";
import { createTopics } from "../createTopics";
import { fetchEventsInBlockRange } from "../networkUtils";
import {
  ECSStateReply,
  ECSStateReplyV2,
  ECSStateSnapshotServiceClient,
  ECSStateSnapshotServiceDefinition,
} from "@latticexyz/services/ecs-snapshot";
import {
  NetworkComponentUpdate,
  ContractConfig,
  NetworkEvents,
  NetworkEvent,
  SystemCallTransaction,
  SystemCall,
} from "../types";
import { CacheStore, createCacheStore, storeEvent, storeEvents } from "./CacheStore";
import ComponentAbi from "@latticexyz/solecs/abi/Component.sol/Component.abi.json";
import WorldAbi from "@latticexyz/solecs/abi/World.sol/World.abi.json";
import { Component, World } from "@latticexyz/solecs/types/ethers-contracts";
import {
  ECSStreamBlockBundleReply,
  ECSStreamServiceClient,
  ECSStreamServiceDefinition,
} from "@latticexyz/services/ecs-stream";
import { createChannel, createClient } from "nice-grpc-web";
import { normalizeComponentID, normalizeEntityID } from "../utils";
import { grpc } from "@improbable-eng/grpc-web";
import { debug as parentDebug } from "./debug";
import { fetchStoreEvents } from "../v2/fetchStoreEvents";
import orderBy from "lodash/orderBy";
import { ComponentValue, Components, Entity } from "@latticexyz/recs";
import { JsonRpcProvider } from "@ethersproject/providers";

const debug = parentDebug.extend("syncUtils");

/**
 * Create a ECSStateSnapshotServiceClient
 * @param url ECSStateSnapshotService URL
 * @returns ECSStateSnapshotServiceClient
 */
export function createSnapshotClient(url: string): ECSStateSnapshotServiceClient {
  return createClient(ECSStateSnapshotServiceDefinition, createChannel(url));
}

/**
 * Create a ECSStreamServiceClient
 * @param url ECSStreamService URL
 * @returns ECSStreamServiceClient
 */
export function createStreamClient(url: string): ECSStreamServiceClient {
  return createClient(ECSStreamServiceDefinition, createChannel(url, grpc.WebsocketTransport()));
}

/**
 * Return the snapshot block number.
 *
 * @param snapshotClient ECSStateSnapshotServiceClient
 * @param worldAddress Address of the World contract to get the snapshot for.
 * @returns Snapsot block number
 */
export async function getSnapshotBlockNumber(
  snapshotClient: ECSStateSnapshotServiceClient | undefined,
  worldAddress: string
): Promise<number> {
  let blockNumber = -1;
  if (!snapshotClient) return blockNumber;
  try {
    const response = await snapshotClient.getStateBlockLatest({ worldAddress });
    blockNumber = response.blockNumber;
  } catch (e) {
    console.error(e);
  }
  return blockNumber;
}

/**
 * Load from the remote snapshot service.
 *
 * @param snapshotClient ECSStateSnapshotServiceClient
 * @param worldAddress Address of the World contract to get the snapshot for.
 * @param decode Function to decode raw component values ({@link createDecode}).
 * @returns Promise resolving with {@link CacheStore} containing the snapshot state.
 * @deprecated this util will be removed in a future version, use fetchSnapshotChunked instead
 */
export async function fetchSnapshot(
  snapshotClient: ECSStateSnapshotServiceClient,
  worldAddress: string,
  decode: ReturnType<typeof createDecode>
): Promise<CacheStore> {
  const cacheStore = createCacheStore();

  try {
    const response = await snapshotClient.getStateLatest({ worldAddress });
    await reduceFetchedState(response, cacheStore, decode);
  } catch (e) {
    console.error(e);
  }

  return cacheStore;
}

/**
 * Load from the remote snapshot service in chunks via a stream.
 *
 * @param snapshotClient ECSStateSnapshotServiceClient
 * @param worldAddress Address of the World contract to get the snapshot for.
 * @param decode Function to decode raw component values ({@link createDecode}).
 * @returns Promise resolving with {@link CacheStore} containing the snapshot state.
 */
export async function fetchSnapshotChunked(
  snapshotClient: ECSStateSnapshotServiceClient,
  worldAddress: string,
  decode: ReturnType<typeof createDecode>,
  numChunks = 10,
  setPercentage?: (percentage: number) => void,
  pruneOptions?: { playerAddress: string; hashedComponentId: string }
): Promise<CacheStore> {
  const cacheStore = createCacheStore();
  const chunkPercentage = Math.ceil(100 / numChunks);

  try {
    const response = pruneOptions
      ? snapshotClient.getStateLatestStreamPrunedV2({
          worldAddress,
          chunkPercentage,
          pruneAddress: pruneOptions?.playerAddress,
          pruneComponentId: pruneOptions?.hashedComponentId,
        })
      : snapshotClient.getStateLatestStreamV2({
          worldAddress,
          chunkPercentage,
        });

    let i = 0;
    for await (const responseChunk of response) {
      await reduceFetchedStateV2(responseChunk, cacheStore, decode);
      setPercentage && setPercentage((i++ / numChunks) * 100);
    }
  } catch (e) {
    console.error(e);
  }

  return cacheStore;
}

/**
 * Reduces a snapshot response by storing corresponding ECS events into the cache store.
 *
 * @param response ECSStateReply
 * @param cacheStore {@link CacheStore} to store snapshot state into.
 * @param decode Function to decode raw component values ({@link createDecode}).
 * @returns Promise resolving once state is reduced into {@link CacheStore}.
 * @deprecated this util will be removed in a future version, use reduceFetchedStateV2 instead
 */
export async function reduceFetchedState(
  response: ECSStateReply,
  cacheStore: CacheStore,
  decode: ReturnType<typeof createDecode>
): Promise<void> {
  const { state, blockNumber, stateComponents, stateEntities } = response;

  for (const { componentIdIdx, entityIdIdx, value: rawValue } of state) {
    const component = to256BitString(stateComponents[componentIdIdx]);
    const entity = stateEntities[entityIdIdx] as Entity;
    const value = await decode(component, rawValue);
    storeEvent(cacheStore, { type: NetworkEvents.NetworkComponentUpdate, component, entity, value, blockNumber });
  }
}

/**
 * Reduces a snapshot response by storing corresponding ECS events into the cache store.
 *
 * @param response ECSStateReplyV2
 * @param cacheStore {@link CacheStore} to store snapshot state into.
 * @param decode Function to decode raw component values ({@link createDecode}).
 * @returns Promise resolving once state is reduced into {@link CacheStore}.
 */
export async function reduceFetchedStateV2(
  response: ECSStateReplyV2,
  cacheStore: CacheStore,
  decode: ReturnType<typeof createDecode>
): Promise<void> {
  const { state, blockNumber, stateComponents, stateEntities } = response;
  const stateEntitiesHex = stateEntities.map((e) => Uint8ArrayToHexString(e) as Entity);
  const stateComponentsHex = stateComponents.map((e) => to256BitString(e));

  for (const { componentIdIdx, entityIdIdx, value: rawValue } of state) {
    const component = stateComponentsHex[componentIdIdx];
    const entity = stateEntitiesHex[entityIdIdx];
    if (entity == undefined) debug("invalid entity index", stateEntities.length, entityIdIdx);
    const value = await decode(component, rawValue);
    storeEvent(cacheStore, { type: NetworkEvents.NetworkComponentUpdate, component, entity, value, blockNumber });
  }
}

/**
 * Create a RxJS stream of {@link NetworkComponentUpdate}s by subscribing to a
 * gRPC streaming service.
 *
 * @param streamServiceUrl URL of the gPRC stream service to subscribe to.
 * @param worldAddress Contract address of the World contract to subscribe to.
 * @param transformWorldEvents Function to transform World events from a stream service ({@link createTransformWorldEventsFromStream}).
 * @returns Stream of {@link NetworkComponentUpdate}s.
 */
export function createLatestEventStreamService(
  streamServiceUrl: string,
  worldAddress: string,
  transformWorldEvents: ReturnType<typeof createTransformWorldEventsFromStream>,
  includeSystemCalls: boolean
): Observable<NetworkEvent> {
  const streamServiceClient = createStreamClient(streamServiceUrl);
  const response = streamServiceClient.subscribeToStreamLatest({
    worldAddress,
    blockNumber: true,
    blockHash: true,
    blockTimestamp: true,
    transactionsConfirmed: false, // do not need txs since each ECSEvent contains the hash
    ecsEvents: true,
    ecsEventsIncludeTxMetadata: includeSystemCalls,
  });

  // Turn stream responses into rxjs NetworkEvent
  return from(response).pipe(
    map(async (responseChunk) => {
      const events = await transformWorldEvents(responseChunk);
      debug(`got ${events.length} events from block ${responseChunk.blockNumber}`);

      if (includeSystemCalls && events.length > 0) {
        const systemCalls = parseSystemCallsFromStreamEvents(events);
        return [...events, ...systemCalls];
      }

      return events;
    }),
    awaitPromise(),
    concatMap((v) => of(...v))
  );
}

/**
 * Create a RxJS stream of {@link NetworkComponentUpdate}s by listening to new
 * blocks from the blockNumber$ stream and fetching the corresponding block
 * from the connected RPC.
 *
 * @dev Only use if {@link createLatestEventStreamService} is not available.
 *
 * @param blockNumber$ Block number stream
 * @param fetchWorldEvents Function to fetch World events in a block range ({@link createFetchWorldEventsInBlockRange}).
 * @returns Stream of {@link NetworkComponentUpdate}s.
 */
export function createLatestEventStreamRPC(
  blockNumber$: Observable<number>,
  fetchWorldEvents: ReturnType<typeof createFetchWorldEventsInBlockRange>,
  boundFetchStoreEvents: (fromBlock: number, toBlock: number) => ReturnType<typeof fetchStoreEvents>,
  fetchSystemCallsFromEvents?: ReturnType<typeof createFetchSystemCallsFromEvents>
): Observable<NetworkEvent> {
  let lastSyncedBlockNumber: number | undefined;

  return blockNumber$.pipe(
    map(async (blockNumber) => {
      const from =
        lastSyncedBlockNumber == null || lastSyncedBlockNumber >= blockNumber ? blockNumber : lastSyncedBlockNumber + 1;
      const to = blockNumber;
      lastSyncedBlockNumber = to;
      const [worldEvents, storeEvents] = await Promise.all([
        fetchWorldEvents(from, to),
        boundFetchStoreEvents(from, to),
      ]);
      const events = orderBy([...worldEvents, ...storeEvents], ["blockNumber", "logIndex"]);
      debug(`fetched ${events.length} events from block range ${from} -> ${to}`);

      if (fetchSystemCallsFromEvents && events.length > 0) {
        const systemCalls = await fetchSystemCallsFromEvents(events, blockNumber);
        return [...events, ...systemCalls];
      }

      return events;
    }),
    awaitPromise(),
    concatMap((v) => of(...v))
  );
}

/**
 * Fetch ECS events from contracts in the given block range.
 *
 * @param fetchWorldEvents Function to fetch World events in a block range ({@link createFetchWorldEventsInBlockRange}).
 * @param fromBlockNumber Start of block range (inclusive).
 * @param toBlockNumber End of block range (inclusive).
 * @param interval Chunk fetching the blocks in intervals to avoid overwhelming the client.
 * @returns Promise resolving with array containing the contract ECS events in the given block range.
 */
export async function fetchEventsInBlockRangeChunked(
  fetchWorldEvents: ReturnType<typeof createFetchWorldEventsInBlockRange>,
  boundFetchStoreEvents: (fromBlock: number, toBlock: number) => ReturnType<typeof fetchStoreEvents>,
  fromBlockNumber: number,
  toBlockNumber: number,
  interval = 50,
  setPercentage?: (percentage: number) => void
): Promise<NetworkComponentUpdate<Components>[]> {
  let events: NetworkComponentUpdate<Components>[] = [];
  const delta = toBlockNumber - fromBlockNumber;
  const numSteps = Math.ceil(delta / interval);
  const steps = [...range(numSteps, interval, fromBlockNumber)];

  for (let i = 0; i < steps.length; i++) {
    const from = steps[i];
    const to = i === steps.length - 1 ? toBlockNumber : steps[i + 1] - 1;
    const [worldEvents, storeEvents] = await Promise.all([fetchWorldEvents(from, to), boundFetchStoreEvents(from, to)]);

    if (setPercentage) setPercentage(((i * interval) / delta) * 100);
    debug(`initial sync fetched ${events.length} events from block range ${from} -> ${to}`);

    events = events.concat(orderBy([...worldEvents, ...storeEvents], ["blockNumber", "logIndex"]));
  }

  return events;
}

/**
 * Fetch ECS state from contracts in the given block range.
 *
 * @param fetchWorldEvents Function to fetch World events in a block range ({@link createFetchWorldEventsInBlockRange}).
 * @param fromBlockNumber Start of block range (inclusive).
 * @param toBlockNumber End of block range (inclusive).
 * @param interval Chunk fetching the blocks in intervals to avoid overwhelming the client.
 * @returns Promise resolving with {@link CacheStore} containing the contract ECS state in the given block range.
 */
export async function fetchStateInBlockRange(
  fetchWorldEvents: ReturnType<typeof createFetchWorldEventsInBlockRange>,
  boundFetchStoreEvents: (fromBlock: number, toBlock: number) => ReturnType<typeof fetchStoreEvents>,
  fromBlockNumber: number,
  toBlockNumber: number,
  interval = 50,
  setPercentage?: (percentage: number) => void
): Promise<CacheStore> {
  const cacheStore = createCacheStore();

  const events = await fetchEventsInBlockRangeChunked(
    fetchWorldEvents,
    boundFetchStoreEvents,
    fromBlockNumber,
    toBlockNumber,
    interval,
    setPercentage
  );

  storeEvents(
    cacheStore,
    events.filter((e) => !e.ephemeral)
  );

  return cacheStore;
}

// Creates a function to decode raw component values
/**
 * Create a function to decode raw component values.
 * Fetches component schemas from the contracts and caches them.
 *
 * @param worldConfig Contract address and interface of the World contract
 * @param provider ethers JsonRpcProvider
 * @returns Function to decode raw component values using their contract component id
 */
export function createDecode(worldConfig: ContractConfig, provider: JsonRpcProvider) {
  const decoders: { [key: string]: (data: BytesLike) => ComponentValue } = {};
  const world = new Contract(worldConfig.address, worldConfig.abi, provider) as World;

  async function decode(componentId: string, data: BytesLike, componentAddress?: string): Promise<ComponentValue> {
    // Create the decoder if it doesn't exist yet
    if (!decoders[componentId]) {
      const address = componentAddress || (await world.getComponent(componentId));
      debug("Creating decoder for", address);
      const component = new Contract(address, ComponentAbi, provider) as Component;
      const [keys, values] = await component.getSchema();
      decoders[componentId] = createDecoder(keys, values);
    }

    // Decode the raw value
    return decoders[componentId](data);
  }

  return decode;
}

/**
 * Create World contract topics for the `ComponentValueSet` and `ComponentValueRemoved` events.
 * @returns World contract topics for the `ComponentValueSet` and `ComponentValueRemoved` events.
 */
export function createWorldTopics() {
  return createTopics<{ World: World }>({
    World: { abi: WorldAbi, topics: ["ComponentValueSet", "ComponentValueRemoved"] },
  });
}

/**
 * Create a function to fetch World contract events in a given block range.
 * @param provider ethers JsonRpcProvider
 * @param worldConfig Contract address and interface of the World contract.
 * @param batch Set to true if the provider supports batch queries (recommended).
 * @param decode Function to decode raw component values ({@link createDecode})
 * @returns Function to fetch World contract events in a given block range.
 */
export function createFetchWorldEventsInBlockRange<C extends Components>(
  provider: JsonRpcProvider,
  worldConfig: ContractConfig,
  batch: boolean | undefined,
  decode: ReturnType<typeof createDecode>
) {
  const topics = createWorldTopics();

  // Fetches World events in the provided block range (including from and to)
  return async (from: number, to: number) => {
    const contractsEvents = await fetchEventsInBlockRange(provider, topics, from, to, { World: worldConfig }, batch);
    const ecsEvents: NetworkComponentUpdate<C>[] = [];

    for (const event of contractsEvents) {
      const { lastEventInTx, txHash, logIndex, args } = event;
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

      const component = normalizeComponentID(rawComponentId);
      const entity = normalizeEntityID(entityId);
      const blockNumber = to;

      const ecsEvent = {
        type: NetworkEvents.NetworkComponentUpdate,
        component,
        entity,
        value: undefined,
        blockNumber,
        logIndex,
        lastEventInTx,
        txHash,
      } as NetworkComponentUpdate<C>;

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

/**
 * Create a function to transform World contract events from a stream service response chunk.
 * @param decode Function to decode raw component values ({@link createDecode})
 * @returns Function to transform World contract events from a stream service.
 */
export function createTransformWorldEventsFromStream(decode: ReturnType<typeof createDecode>) {
  return async (message: ECSStreamBlockBundleReply) => {
    const { blockNumber, ecsEvents } = message;

    const convertedEcsEvents: NetworkComponentUpdate[] = [];

    for (let i = 0; i < ecsEvents.length; i++) {
      const ecsEvent = ecsEvents[i];

      const rawComponentId = ecsEvent.componentId;
      const entityId = ecsEvent.entityId;
      const txHash = ecsEvent.txHash;

      const component = normalizeComponentID(rawComponentId);
      const entity = normalizeEntityID(entityId);

      const value = ecsEvent.eventType === "ComponentValueSet" ? await decode(component, ecsEvent.value) : undefined;

      // Since ECS events are coming in ordered over the wire, we check if the following event has a
      // different transaction then the current, which would mean an event associated with another
      // tx
      const lastEventInTx = ecsEvents[i + 1]?.txHash !== ecsEvent.txHash;

      convertedEcsEvents.push({
        type: NetworkEvents.NetworkComponentUpdate,
        component,
        entity,
        value,
        blockNumber,
        lastEventInTx,
        txHash,
        txMetadata: ecsEvent.txMetadata,
      });
    }

    return convertedEcsEvents;
  };
}

function groupByTxHash(events: NetworkComponentUpdate[]) {
  return events.reduce((acc, event) => {
    if (["worker", "cache"].includes(event.txHash)) return acc;

    if (!acc[event.txHash]) acc[event.txHash] = [];

    acc[event.txHash].push(event);

    return acc;
  }, {} as { [key: string]: NetworkComponentUpdate[] });
}

function parseSystemCallTransactionFromStreamNetworkComponentUpdate(event: NetworkComponentUpdate) {
  if (!event.txMetadata) return null;

  const { to, data, value } = event.txMetadata;

  return {
    to,
    data: BigNumber.from(data).toHexString(),
    value: BigNumber.from(value),
    hash: event.txHash,
  } as SystemCallTransaction;
}

export function parseSystemCallsFromStreamEvents(events: NetworkComponentUpdate[]) {
  const systemCalls: SystemCall[] = [];
  const transactionHashToEvents = groupByTxHash(events);

  for (const txHash of Object.keys(transactionHashToEvents)) {
    // All ECS events include the information needed to parse the SysytemCallTransasction out, so it doesn't
    // matter which one we take here.
    const tx = parseSystemCallTransactionFromStreamNetworkComponentUpdate(transactionHashToEvents[txHash][0]);
    if (!tx) continue;

    systemCalls.push({
      type: NetworkEvents.SystemCall,
      tx,
      updates: transactionHashToEvents[tx.hash],
    });
  }

  return systemCalls;
}

export function createFetchSystemCallsFromEvents(provider: JsonRpcProvider) {
  const { fetchBlock, clearBlock } = createBlockCache(provider);
  const fetchSystemCallData = createFetchSystemCallData(fetchBlock);

  return async (events: NetworkComponentUpdate[], blockNumber: number) => {
    const systemCalls: SystemCall[] = [];
    const transactionHashToEvents = groupByTxHash(events);

    const txData = await Promise.all(
      Object.keys(transactionHashToEvents).map((hash) => fetchSystemCallData(hash, blockNumber))
    );
    clearBlock(blockNumber);

    for (const tx of txData) {
      if (!tx) continue;

      systemCalls.push({
        type: NetworkEvents.SystemCall,
        tx,
        updates: transactionHashToEvents[tx.hash],
      });
    }

    return systemCalls;
  };
}

function createFetchSystemCallData(fetchBlock: ReturnType<typeof createBlockCache>["fetchBlock"]) {
  return async (txHash: string, blockNumber: number) => {
    const block = await fetchBlock(blockNumber);
    const tx = block.transactions.find((tx) => tx.hash === txHash);

    if (!tx) return;

    return {
      to: tx.to,
      data: tx.data,
      value: tx.value,
      hash: tx.hash,
    } as SystemCallTransaction;
  };
}

function createBlockCache(provider: JsonRpcProvider) {
  const blocks: Record<number, Awaited<ReturnType<typeof provider.getBlockWithTransactions>>> = {};

  return {
    fetchBlock: async (blockNumber: number) => {
      if (blocks[blockNumber]) return blocks[blockNumber];

      const block = await provider.getBlockWithTransactions(blockNumber);
      blocks[blockNumber] = block;

      return block;
    },
    clearBlock: (blockNumber: number) => delete blocks[blockNumber],
  };
}
