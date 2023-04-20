@latticexyz/network

# @latticexyz/network

## Table of contents

### Enumerations

- [ConnectionState](enums/ConnectionState.md)
- [ContractSchemaValue](enums/ContractSchemaValue.md)
- [InputType](enums/InputType.md)
- [NetworkEvents](enums/NetworkEvents.md)
- [SyncState](enums/SyncState.md)

### Classes

- [SyncWorker](classes/SyncWorker.md)

### Interfaces

- [ClockConfig](interfaces/ClockConfig.md)
- [NetworkConfig](interfaces/NetworkConfig.md)
- [ProviderConfig](interfaces/ProviderConfig.md)

### Type Aliases

- [Ack](README.md#ack)
- [CacheStore](README.md#cachestore)
- [Clock](README.md#clock)
- [Config](README.md#config)
- [ContractConfig](README.md#contractconfig)
- [ContractEvent](README.md#contractevent)
- [ContractSchemaValueTypes](README.md#contractschemavaluetypes)
- [ContractTopics](README.md#contracttopics)
- [Contracts](README.md#contracts)
- [ContractsConfig](README.md#contractsconfig)
- [ECSCache](README.md#ecscache)
- [Input](README.md#input)
- [Mappings](README.md#mappings)
- [Network](README.md#network)
- [NetworkComponentUpdate](README.md#networkcomponentupdate)
- [NetworkEvent](README.md#networkevent)
- [Providers](README.md#providers)
- [State](README.md#state)
- [SyncStateStruct](README.md#syncstatestruct)
- [SyncWorkerConfig](README.md#syncworkerconfig)
- [SystemCall](README.md#systemcall)
- [SystemCallTransaction](README.md#systemcalltransaction)
- [TopicsConfig](README.md#topicsconfig)
- [TxQueue](README.md#txqueue)

### Variables

- [ContractSchemaValueArrayToElement](README.md#contractschemavaluearraytoelement)
- [ContractSchemaValueId](README.md#contractschemavalueid)
- [GodID](README.md#godid)
- [SingletonID](README.md#singletonid)
- [ack](README.md#ack-1)

### Functions

- [createBlockNumberStream](README.md#createblocknumberstream)
- [createCacheStore](README.md#createcachestore)
- [createContracts](README.md#createcontracts)
- [createDecode](README.md#createdecode)
- [createDecoder](README.md#createdecoder)
- [createEncoder](README.md#createencoder)
- [createFastTxExecutor](README.md#createfasttxexecutor)
- [createFaucetService](README.md#createfaucetservice)
- [createFetchSystemCallsFromEvents](README.md#createfetchsystemcallsfromevents)
- [createFetchWorldEventsInBlockRange](README.md#createfetchworldeventsinblockrange)
- [createLatestEventStreamRPC](README.md#createlatesteventstreamrpc)
- [createLatestEventStreamService](README.md#createlatesteventstreamservice)
- [createNetwork](README.md#createnetwork)
- [createProvider](README.md#createprovider)
- [createReconnectingProvider](README.md#createreconnectingprovider)
- [createRelayStream](README.md#createrelaystream)
- [createSigner](README.md#createsigner)
- [createSnapshotClient](README.md#createsnapshotclient)
- [createStreamClient](README.md#createstreamclient)
- [createSyncWorker](README.md#createsyncworker)
- [createSystemExecutor](README.md#createsystemexecutor)
- [createTopics](README.md#createtopics)
- [createTransformWorldEventsFromStream](README.md#createtransformworldeventsfromstream)
- [createTxQueue](README.md#createtxqueue)
- [createWorldTopics](README.md#createworldtopics)
- [ensureNetworkIsUp](README.md#ensurenetworkisup)
- [fetchBlock](README.md#fetchblock)
- [fetchEventsInBlockRange](README.md#fetcheventsinblockrange)
- [fetchEventsInBlockRangeChunked](README.md#fetcheventsinblockrangechunked)
- [fetchLogs](README.md#fetchlogs)
- [fetchSnapshot](README.md#fetchsnapshot)
- [fetchSnapshotChunked](README.md#fetchsnapshotchunked)
- [fetchStateInBlockRange](README.md#fetchstateinblockrange)
- [flattenValue](README.md#flattenvalue)
- [getCacheId](README.md#getcacheid)
- [getCacheStoreEntries](README.md#getcachestoreentries)
- [getIndexDBCacheStoreBlockNumber](README.md#getindexdbcachestoreblocknumber)
- [getIndexDbECSCache](README.md#getindexdbecscache)
- [getRevertReason](README.md#getrevertreason)
- [getSnapshotBlockNumber](README.md#getsnapshotblocknumber)
- [isNetworkComponentUpdateEvent](README.md#isnetworkcomponentupdateevent)
- [isSystemCallEvent](README.md#issystemcallevent)
- [loadIndexDbCacheStore](README.md#loadindexdbcachestore)
- [mergeCacheStores](README.md#mergecachestores)
- [messagePayload](README.md#messagepayload)
- [normalizeComponentID](README.md#normalizecomponentid)
- [normalizeEntityID](README.md#normalizeentityid)
- [parseSystemCallsFromStreamEvents](README.md#parsesystemcallsfromstreamevents)
- [reduceFetchedState](README.md#reducefetchedstate)
- [reduceFetchedStateV2](README.md#reducefetchedstatev2)
- [saveCacheStoreToIndexDb](README.md#savecachestoretoindexdb)
- [storeEvent](README.md#storeevent)
- [storeEvents](README.md#storeevents)

## Type Aliases

### Ack

Ƭ **Ack**: `Object`

#### Type declaration

| Name   | Type                            |
| :----- | :------------------------------ |
| `type` | [`Ack`](enums/InputType.md#ack) |

#### Defined in

[workers/SyncWorker.ts:65](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L65)

---

### CacheStore

Ƭ **CacheStore**: `ReturnType`<typeof [`createCacheStore`](README.md#createcachestore)\>

#### Defined in

[workers/CacheStore.ts:12](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L12)

---

### Clock

Ƭ **Clock**: `Object`

#### Type declaration

| Name             | Type                                                      |
| :--------------- | :-------------------------------------------------------- |
| `currentTime`    | `number`                                                  |
| `dispose`        | () => `void`                                              |
| `lastUpdateTime` | `number`                                                  |
| `time$`          | `Observable`<`number`\>                                   |
| `update`         | (`time`: `number`, `maintainStale?`: `boolean`) => `void` |

#### Defined in

[types.ts:31](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L31)

---

### Config

Ƭ **Config**: `Object`

#### Type declaration

| Name   | Type                                             |
| :----- | :----------------------------------------------- |
| `data` | [`SyncWorkerConfig`](README.md#syncworkerconfig) |
| `type` | [`Config`](enums/InputType.md#config)            |

#### Defined in

[workers/SyncWorker.ts:64](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L64)

---

### ContractConfig

Ƭ **ContractConfig**: `Object`

#### Type declaration

| Name      | Type                |
| :-------- | :------------------ |
| `abi`     | `ContractInterface` |
| `address` | `string`            |

#### Defined in

[types.ts:51](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L51)

---

### ContractEvent

Ƭ **ContractEvent**<`C`\>: `Object`

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Type declaration

| Name            | Type      |
| :-------------- | :-------- |
| `args`          | `Result`  |
| `blockNumber`   | `number`  |
| `contractKey`   | keyof `C` |
| `eventKey`      | `string`  |
| `lastEventInTx` | `boolean` |
| `logIndex?`     | `number`  |
| `txHash`        | `string`  |

#### Defined in

[types.ts:67](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L67)

---

### ContractSchemaValueTypes

Ƭ **ContractSchemaValueTypes**: `Object`

#### Type declaration

| Name | Type        |
| :--- | :---------- |
| `0`  | `boolean`   |
| `1`  | `number`    |
| `10` | `number`    |
| `11` | `string`    |
| `12` | `string`    |
| `13` | `string`    |
| `14` | `string`    |
| `15` | `string`    |
| `16` | `string`    |
| `17` | `string`    |
| `18` | `boolean`[] |
| `19` | `number`[]  |
| `2`  | `number`    |
| `20` | `number`[]  |
| `21` | `number`[]  |
| `22` | `string`[]  |
| `23` | `string`[]  |
| `24` | `string`[]  |
| `25` | `string`[]  |
| `26` | `number`[]  |
| `27` | `number`[]  |
| `28` | `number`[]  |
| `29` | `string`[]  |
| `3`  | `number`    |
| `30` | `string`[]  |
| `31` | `string`[]  |
| `32` | `string`[]  |
| `33` | `string`[]  |
| `4`  | `string`    |
| `5`  | `string`    |
| `6`  | `string`    |
| `7`  | `string`    |
| `8`  | `number`    |
| `9`  | `number`    |

#### Defined in

[types.ts:242](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L242)

---

### ContractTopics

Ƭ **ContractTopics**: `Object`

#### Type declaration

| Name     | Type         |
| :------- | :----------- |
| `key`    | `string`     |
| `topics` | `string`[][] |

#### Defined in

[types.ts:62](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L62)

---

### Contracts

Ƭ **Contracts**: `Object`

#### Index signature

▪ [key: `string`]: `BaseContract`

#### Defined in

[types.ts:47](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L47)

---

### ContractsConfig

Ƭ **ContractsConfig**<`C`\>: { [key in keyof C]: ContractConfig }

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Defined in

[types.ts:56](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L56)

---

### ECSCache

Ƭ **ECSCache**: `Awaited`<`ReturnType`<typeof [`getIndexDbECSCache`](README.md#getindexdbecscache)\>\>

#### Defined in

[workers/CacheStore.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L13)

---

### Input

Ƭ **Input**: [`Config`](README.md#config) \| [`Ack`](README.md#ack)

#### Defined in

[workers/SyncWorker.ts:67](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L67)

---

### Mappings

Ƭ **Mappings**<`C`\>: `Object`

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

#### Index signature

▪ [hashedContractId: `string`]: keyof `C`

#### Defined in

[types.ts:80](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L80)

---

### Network

Ƭ **Network**: `Awaited`<`ReturnType`<typeof [`createNetwork`](README.md#createnetwork)\>\>

#### Defined in

[createNetwork.ts:12](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createNetwork.ts#L12)

---

### NetworkComponentUpdate

Ƭ **NetworkComponentUpdate**<`C`\>: { [key in keyof C]: Object }[keyof `C`] & { `blockNumber`: `number` ; `entity`: `EntityID` ; `lastEventInTx`: `boolean` ; `logIndex?`: `number` ; `txHash`: `string` ; `txMetadata?`: `TxMetadata` }

#### Type parameters

| Name | Type                                |
| :--- | :---------------------------------- |
| `C`  | extends `Components` = `Components` |

#### Defined in

[types.ts:84](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L84)

---

### NetworkEvent

Ƭ **NetworkEvent**<`C`\>: [`NetworkComponentUpdate`](README.md#networkcomponentupdate)<`C`\> \| [`SystemCall`](README.md#systemcall)

#### Type parameters

| Name | Type                                |
| :--- | :---------------------------------- |
| `C`  | extends `Components` = `Components` |

#### Defined in

[types.ts:121](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L121)

---

### Providers

Ƭ **Providers**: `ReturnType`<typeof [`createProvider`](README.md#createprovider)\>

#### Defined in

[createProvider.ts:8](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createProvider.ts#L8)

---

### State

Ƭ **State**: `Map`<`number`, `ComponentValue`\>

#### Defined in

[workers/CacheStore.ts:11](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L11)

---

### SyncStateStruct

Ƭ **SyncStateStruct**: `Object`

#### Type declaration

| Name         | Type                              |
| :----------- | :-------------------------------- |
| `msg`        | `string`                          |
| `percentage` | `number`                          |
| `state`      | [`SyncState`](enums/SyncState.md) |

#### Defined in

[types.ts:279](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L279)

---

### SyncWorkerConfig

Ƭ **SyncWorkerConfig**: `Object`

#### Type declaration

| Name                             | Type                                                          |
| :------------------------------- | :------------------------------------------------------------ |
| `cacheAgeThreshold?`             | `number`                                                      |
| `cacheInterval?`                 | `number`                                                      |
| `chainId`                        | `number`                                                      |
| `disableCache?`                  | `boolean`                                                     |
| `fetchSystemCalls?`              | `boolean`                                                     |
| `initialBlockNumber`             | `number`                                                      |
| `modeUrl?`                       | `string`                                                      |
| `provider`                       | [`ProviderConfig`](interfaces/ProviderConfig.md)              |
| `pruneOptions?`                  | { `hashedComponentId`: `string` ; `playerAddress`: `string` } |
| `pruneOptions.hashedComponentId` | `string`                                                      |
| `pruneOptions.playerAddress`     | `string`                                                      |
| `snapshotNumChunks?`             | `number`                                                      |
| `snapshotServiceUrl?`            | `string`                                                      |
| `streamServiceUrl?`              | `string`                                                      |
| `worldContract`                  | [`ContractConfig`](README.md#contractconfig)                  |

#### Defined in

[types.ts:133](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L133)

---

### SystemCall

Ƭ **SystemCall**<`C`\>: `Object`

#### Type parameters

| Name | Type                                |
| :--- | :---------------------------------- |
| `C`  | extends `Components` = `Components` |

#### Type declaration

| Name      | Type                                                           |
| :-------- | :------------------------------------------------------------- |
| `tx`      | [`SystemCallTransaction`](README.md#systemcalltransaction)     |
| `type`    | [`SystemCall`](enums/NetworkEvents.md#systemcall)              |
| `updates` | [`NetworkComponentUpdate`](README.md#networkcomponentupdate)[] |

#### Defined in

[types.ts:110](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L110)

---

### SystemCallTransaction

Ƭ **SystemCallTransaction**: `Object`

#### Type declaration

| Name    | Type        |
| :------ | :---------- |
| `data`  | `string`    |
| `hash`  | `string`    |
| `to`    | `string`    |
| `value` | `BigNumber` |

#### Defined in

[types.ts:103](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L103)

---

### TopicsConfig

Ƭ **TopicsConfig**<`C`\>: { [ContractType in keyof C]: Object }

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Defined in

[createTopics.ts:5](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createTopics.ts#L5)

---

### TxQueue

Ƭ **TxQueue**<`C`\>: `Cached`<`C`\>

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Defined in

[types.ts:60](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L60)

## Variables

### ContractSchemaValueArrayToElement

• `Const` **ContractSchemaValueArrayToElement**: `Object`

#### Type declaration

| Name | Type                                                  |
| :--- | :---------------------------------------------------- |
| `0`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `1`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `10` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `11` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `12` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `13` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `14` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `15` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `16` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `17` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `18` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `19` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `2`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `20` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `21` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `22` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `23` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `24` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `25` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `26` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `27` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `28` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `29` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `3`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `30` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `31` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `32` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `33` | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `4`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `5`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `6`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `7`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `8`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |
| `9`  | [`ContractSchemaValue`](enums/ContractSchemaValue.md) |

#### Defined in

[types.ts:223](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L223)

---

### ContractSchemaValueId

• `Const` **ContractSchemaValueId**: { [key in ContractSchemaValue]: string }

#### Defined in

[types.ts:186](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L186)

---

### GodID

• `Const` **GodID**: `EntityID` = `SingletonID`

**`Deprecated`**

Import SingletonID instead

#### Defined in

[workers/constants.ts:12](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/constants.ts#L12)

---

### SingletonID

• `Const` **SingletonID**: `EntityID`

#### Defined in

[workers/constants.ts:9](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/constants.ts#L9)

---

### ack

• `Const` **ack**: `Object`

#### Type declaration

| Name   | Type                            |
| :----- | :------------------------------ |
| `type` | [`Ack`](enums/InputType.md#ack) |

#### Defined in

[workers/SyncWorker.ts:66](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L66)

## Functions

### createBlockNumberStream

▸ **createBlockNumberStream**(`providers`, `options?`): `Object`

Creates a stream of block numbers based on the `block` event of the currently connected provider.
In case `initialSync` is provided, this stream will also output a stream of past block numbers to drive replaying events.

#### Parameters

| Name                                     | Type                                                                                                                                       | Description                                                                                                     |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `providers`                              | `IComputedValue`<`undefined` \| { `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> | Mobx computed providers object (created by [createReconnectingProvider](README.md#createreconnectingprovider)). |
| `options?`                               | `Object`                                                                                                                                   |                                                                                                                 |
| `options.initialSync?`                   | `Object`                                                                                                                                   | -                                                                                                               |
| `options.initialSync.initialBlockNumber` | `number`                                                                                                                                   | -                                                                                                               |
| `options.initialSync.interval`           | `number`                                                                                                                                   | -                                                                                                               |

#### Returns

`Object`

Stream of block numbers based on connected provider's `block` event.

| Name           | Type                    |
| :------------- | :---------------------- |
| `blockNumber$` | `Observable`<`number`\> |
| `dispose`      | `IReactionDisposer`     |

#### Defined in

[createBlockNumberStream.ts:15](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createBlockNumberStream.ts#L15)

---

### createCacheStore

▸ **createCacheStore**(): `Object`

#### Returns

`Object`

| Name               | Type                       |
| :----------------- | :------------------------- |
| `blockNumber`      | `number`                   |
| `componentToIndex` | `Map`<`string`, `number`\> |
| `components`       | `string`[]                 |
| `entities`         | `string`[]                 |
| `entityToIndex`    | `Map`<`string`, `number`\> |
| `state`            | [`State`](README.md#state) |

#### Defined in

[workers/CacheStore.ts:19](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L19)

---

### createContracts

▸ **createContracts**<`C`\>(`config:`): `Promise`<{ `config`: [`ContractsConfig`](README.md#contractsconfig)<`C`\> ; `contracts`: `IComputedValue`

Create an object of contracts connected to the currently connected provider.

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Parameters

| Name                       | Type                                                                                     | Description                                  |
| :------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------- |
| `config:`                  | `Object`                                                                                 | [ContractsConfig](README.md#contractsconfig) |
| `config:.asyncConfig?`     | (`contracts`: `C`) => `Promise`<`Partial`<[`ContractsConfig`](README.md#contractsconfig) | -                                            |
| `config:.config`           | `Partial`<[`ContractsConfig`](README.md#contractsconfig)                                 | -                                            |
| `config:.signerOrProvider` | `IComputedValue`<`Signer` \| `Provider`\>                                                | -                                            |

#### Returns

`Promise`<{ `config`: [`ContractsConfig`](README.md#contractsconfig)<`C`\> ; `contracts`: `IComputedValue`

Object with contracts connected to the currently connected provider.

#### Defined in

[createContracts.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createContracts.ts#L13)

---

### createDecode

▸ **createDecode**(`worldConfig`, `provider`): (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\>

Create a function to decode raw component values.
Fetches component schemas from the contracts and caches them.

#### Parameters

| Name          | Type                                         | Description                                          |
| :------------ | :------------------------------------------- | :--------------------------------------------------- |
| `worldConfig` | [`ContractConfig`](README.md#contractconfig) | Contract address and interface of the World contract |
| `provider`    | `JsonRpcProvider`                            | ethers JsonRpcProvider                               |

#### Returns

`fn`

Function to decode raw component values using their contract component id

▸ (`componentId`, `data`, `componentAddress?`): `Promise`<`ComponentValue`\>

##### Parameters

| Name                | Type        |
| :------------------ | :---------- |
| `componentId`       | `string`    |
| `data`              | `BytesLike` |
| `componentAddress?` | `string`    |

##### Returns

`Promise`<`ComponentValue`\>

#### Defined in

[workers/syncUtils.ts:367](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L367)

---

### createDecoder

▸ **createDecoder**<`D`\>(`keys`, `valueTypes`): (`data`: `BytesLike`) => `D`

Construct a decoder function from given keys and valueTypes.
The consumer is responsible for providing a type D matching the keys and valueTypes.

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `D`  | extends `Object` |

#### Parameters

| Name         | Type                                                    | Description                                |
| :----------- | :------------------------------------------------------ | :----------------------------------------- |
| `keys`       | keyof `D`[]                                             | Keys of the component value schema.        |
| `valueTypes` | [`ContractSchemaValue`](enums/ContractSchemaValue.md)[] | Value types if the component value schema. |

#### Returns

`fn`

Function to decode encoded hex value to component value.

▸ (`data`): `D`

##### Parameters

| Name   | Type        |
| :----- | :---------- |
| `data` | `BytesLike` |

##### Returns

`D`

#### Defined in

[createDecoder.ts:74](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createDecoder.ts#L74)

---

### createEncoder

▸ **createEncoder**<`D`\>(`keys`, `valueTypes`): (`value`: `D`) => `string`

Creates a function to automatically encode component values given a contract component schema.

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `D`  | extends `Object` |

#### Parameters

| Name         | Type                                                    | Description        |
| :----------- | :------------------------------------------------------ | :----------------- |
| `keys`       | keyof `D`[]                                             | Schema keys        |
| `valueTypes` | [`ContractSchemaValue`](enums/ContractSchemaValue.md)[] | Schema value types |

#### Returns

`fn`

Function to encode component values

▸ (`value`): `string`

##### Parameters

| Name    | Type |
| :------ | :--- |
| `value` | `D`  |

##### Returns

`string`

#### Defined in

[createEncoder.ts:11](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createEncoder.ts#L11)

---

### createFastTxExecutor

▸ **createFastTxExecutor**(`signer`, `globalOptions?`): `Promise`<{ `currentNonce`: `Readonly`<{ `nonce`: `number` }\> ; `fastTxExecute`: <C, F\>(`contract`: `C`, `func`: `F`, `args`: `Parameters`<`C`[`F`]\>, `options`: { `retryCount?`: `number` }) => `Promise`<{ `hash`: `string` ; `tx`: `ReturnType`<`C`[`F`]\> }\> ; `gasConfig`: `Readonly`<{ `maxFeePerGas?`: `BigNumber` ; `maxPriorityFeePerGas?`: `number` }\> ; `updateFeePerGas`: (`multiplier`: `number`) => `Promise`<`void`\> }\>

Create a stateful util to execute transactions as fast as possible.
Internal state includes the current nonce and the current gas price.

Note: since the signer's nonce is managed in the internal state of this
function, using the same signer to send transactions outside of this function
or creating multiple instances of this function with the same signer will result
in nonce errors.

#### Parameters

| Name                                  | Type                                         |
| :------------------------------------ | :------------------------------------------- |
| `signer`                              | `Signer` & { `provider`: `JsonRpcProvider` } |
| `globalOptions`                       | `Object`                                     |
| `globalOptions.priorityFeeMultiplier` | `number`                                     |

#### Returns

`Promise`<{ `currentNonce`: `Readonly`<{ `nonce`: `number` }\> ; `fastTxExecute`: <C, F\>(`contract`: `C`, `func`: `F`, `args`: `Parameters`<`C`[`F`]\>, `options`: { `retryCount?`: `number` }) => `Promise`<{ `hash`: `string` ; `tx`: `ReturnType`<`C`[`F`]\> }\> ; `gasConfig`: `Readonly`<{ `maxFeePerGas?`: `BigNumber` ; `maxPriorityFeePerGas?`: `number` }\> ; `updateFeePerGas`: (`multiplier`: `number`) => `Promise`<`void`\> }\>

#### Defined in

[createFastTxExecutor.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createFastTxExecutor.ts#L13)

---

### createFaucetService

▸ **createFaucetService**(`url`): `RawClient`<`FromTsProtoServiceDefinition`<typeof `FaucetServiceDefinition`\>\>

Create a FaucetServiceClient

#### Parameters

| Name  | Type     | Description       |
| :---- | :------- | :---------------- |
| `url` | `string` | FaucetService URL |

#### Returns

`RawClient`<`FromTsProtoServiceDefinition`<typeof `FaucetServiceDefinition`\>\>

FaucetServiceClient

#### Defined in

[createFaucetService.ts:10](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createFaucetService.ts#L10)

---

### createFetchSystemCallsFromEvents

▸ **createFetchSystemCallsFromEvents**(`provider`): (`events`: [`NetworkComponentUpdate`](README.md#networkcomponentupdate)<`Components`\>[], `blockNumber`: `number`) => `Promise`<[`SystemCall`](README.md#systemcall)

#### Parameters

| Name       | Type              |
| :--------- | :---------------- |
| `provider` | `JsonRpcProvider` |

#### Returns

`fn`

▸ (`events`, `blockNumber`): `Promise`<[`SystemCall`](README.md#systemcall)

##### Parameters

| Name          | Type                                                           |
| :------------ | :------------------------------------------------------------- |
| `events`      | [`NetworkComponentUpdate`](README.md#networkcomponentupdate)[] |
| `blockNumber` | `number`                                                       |

##### Returns

`Promise`<[`SystemCall`](README.md#systemcall)

#### Defined in

[workers/syncUtils.ts:551](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L551)

---

### createFetchWorldEventsInBlockRange

▸ **createFetchWorldEventsInBlockRange**<`C`\>(`provider`, `worldConfig`, `batch`, `decode`): (`from`: `number`, `to`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

Create a function to fetch World contract events in a given block range.

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

#### Parameters

| Name          | Type                                                                                                          | Description                                                                      |
| :------------ | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| `provider`    | `JsonRpcProvider`                                                                                             | ethers JsonRpcProvider                                                           |
| `worldConfig` | [`ContractConfig`](README.md#contractconfig)                                                                  | Contract address and interface of the World contract.                            |
| `batch`       | `undefined` \| `boolean`                                                                                      | Set to true if the provider supports batch queries (recommended).                |
| `decode`      | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | Function to decode raw component values ([createDecode](README.md#createdecode)) |

#### Returns

`fn`

Function to fetch World contract events in a given block range.

▸ (`from`, `to`): `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

##### Parameters

| Name   | Type     |
| :----- | :------- |
| `from` | `number` |
| `to`   | `number` |

##### Returns

`Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

#### Defined in

[workers/syncUtils.ts:406](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L406)

---

### createLatestEventStreamRPC

▸ **createLatestEventStreamRPC**(`blockNumber$`, `fetchWorldEvents`, `boundFetchStoreEvents`, `fetchSystemCallsFromEvents?`): `Observable`<[`NetworkEvent`](README.md#networkevent)\>

Create a RxJS stream of [NetworkComponentUpdate](README.md#networkcomponentupdate)s by listening to new
blocks from the blockNumber$ stream and fetching the corresponding block
from the connected RPC.

**`Dev`**

Only use if [createLatestEventStreamService](README.md#createlatesteventstreamservice) is not available.

#### Parameters

| Name                          | Type                                                                                                                                                                 | Description                                                                                                                           |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `blockNumber$`                | `Observable`<`number`\>                                                                                                                                              | Block number stream                                                                                                                   |
| `fetchWorldEvents`            | (`from`: `number`, `to`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)                                                         | Function to fetch World events in a block range ([createFetchWorldEventsInBlockRange](README.md#createfetchworldeventsinblockrange)). |
| `boundFetchStoreEvents`       | (`fromBlock`: `number`, `toBlock`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)                                               | -                                                                                                                                     |
| `fetchSystemCallsFromEvents?` | (`events`: [`NetworkComponentUpdate`](README.md#networkcomponentupdate)<`Components`\>[], `blockNumber`: `number`) => `Promise`<[`SystemCall`](README.md#systemcall) | -                                                                                                                                     |

#### Returns

`Observable`<[`NetworkEvent`](README.md#networkevent)\>

Stream of [NetworkComponentUpdate](README.md#networkcomponentupdate)s.

#### Defined in

[workers/syncUtils.ts:256](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L256)

---

### createLatestEventStreamService

▸ **createLatestEventStreamService**(`streamServiceUrl`, `worldAddress`, `transformWorldEvents`, `includeSystemCalls`): `Observable`<[`NetworkEvent`](README.md#networkevent)\>

Create a RxJS stream of [NetworkComponentUpdate](README.md#networkcomponentupdate)s by subscribing to a
gRPC streaming service.

#### Parameters

| Name                   | Type                                                                                                               | Description                                                                                                                                        |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `streamServiceUrl`     | `string`                                                                                                           | URL of the gPRC stream service to subscribe to.                                                                                                    |
| `worldAddress`         | `string`                                                                                                           | Contract address of the World contract to subscribe to.                                                                                            |
| `transformWorldEvents` | (`message`: `ECSStreamBlockBundleReply`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate) | Function to transform World events from a stream service ([createTransformWorldEventsFromStream](README.md#createtransformworldeventsfromstream)). |
| `includeSystemCalls`   | `boolean`                                                                                                          | -                                                                                                                                                  |

#### Returns

`Observable`<[`NetworkEvent`](README.md#networkevent)\>

Stream of [NetworkComponentUpdate](README.md#networkcomponentupdate)s.

#### Defined in

[workers/syncUtils.ts:210](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L210)

---

### createNetwork

▸ **createNetwork**(`initialConfig`): `Promise`<{ `blockNumber$`: `Observable`<`number`\> ; `clock`: [`Clock`](README.md#clock) ; `config`: [`NetworkConfig`](interfaces/NetworkConfig.md) ; `connected`: `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\> ; `connectedAddress`: `IComputedValue`<`undefined` \| `string`\> ; `connectedAddressChecksummed`: `IComputedValue`<`undefined` \| `string`\> ; `dispose`: () => `void` ; `providers`: `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> ; `signer`: `IComputedValue`

Set up network.

#### Parameters

| Name            | Type                                           | Description                                                        |
| :-------------- | :--------------------------------------------- | :----------------------------------------------------------------- |
| `initialConfig` | [`NetworkConfig`](interfaces/NetworkConfig.md) | Initial config (see [NetworkConfig](interfaces/NetworkConfig.md)). |

#### Returns

`Promise`<{ `blockNumber$`: `Observable`<`number`\> ; `clock`: [`Clock`](README.md#clock) ; `config`: [`NetworkConfig`](interfaces/NetworkConfig.md) ; `connected`: `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\> ; `connectedAddress`: `IComputedValue`<`undefined` \| `string`\> ; `connectedAddressChecksummed`: `IComputedValue`<`undefined` \| `string`\> ; `dispose`: () => `void` ; `providers`: `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> ; `signer`: `IComputedValue`

Network object

#### Defined in

[createNetwork.ts:20](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createNetwork.ts#L20)

---

### createProvider

▸ **createProvider**(`config`): `Object`

Create a JsonRpcProvider and WebsocketProvider pair

#### Parameters

| Name     | Type                                             | Description                                                                        |
| :------- | :----------------------------------------------- | :--------------------------------------------------------------------------------- |
| `config` | [`ProviderConfig`](interfaces/ProviderConfig.md) | Config for the provider pair (see [ProviderConfig](interfaces/ProviderConfig.md)). |

#### Returns

`Object`

Provider pair: {
json: JsonRpcProvider,
ws: WebSocketProvider
}

| Name   | Type                                              |
| :----- | :------------------------------------------------ |
| `json` | `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` |
| `ws`   | `undefined` \| `WebSocketProvider`                |

#### Defined in

[createProvider.ts:19](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createProvider.ts#L19)

---

### createReconnectingProvider

▸ **createReconnectingProvider**(`config`): `Promise`<{ `connected`: `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\> ; `dispose`: () => `void` ; `providers`: `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> }\>

Creates a [provider pair](README.md#createprovider) that automatically updates if the config changes
and automatically reconnects if the connection is lost.

#### Parameters

| Name     | Type                                                                | Description                                                                                                                                                        |
| :------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config` | `IComputedValue`<[`ProviderConfig`](interfaces/ProviderConfig.md)\> | Mobx computed provider config object (see [ProviderConfig](interfaces/ProviderConfig.md)). Automatically updates the returned provider pair if the config changes. |

#### Returns

`Promise`<{ `connected`: `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\> ; `dispose`: () => `void` ; `providers`: `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> }\>

Automatically reconnecting [provider pair](README.md#createprovider) that updates if the config changes.

#### Defined in

[createProvider.ts:54](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createProvider.ts#L54)

---

### createRelayStream

▸ **createRelayStream**(`signer`, `url`, `id`): `Promise`<{ `countConnected`: () => `Promise`<`number`\> ; `dispose`: () => `void` ; `event$`: `Observable`<{ `address`: `any` ; `message`: `Message` }\> ; `ping`: () => `Promise`<`Identity`\> ; `push`: (`label`: `string`, `data`: `Uint8Array`) => `Promise`<`void`\> ; `subscribe`: (`label`: `string`) => `void` ; `unsubscribe`: (`label`: `string`) => `void` }\>

Create a RelayService connection, including event$ and utils

#### Parameters

| Name     | Type     | Description          |
| :------- | :------- | :------------------- |
| `signer` | `Signer` | -                    |
| `url`    | `string` | ECSRelayService URL  |
| `id`     | `string` | User id (eg address) |

#### Returns

`Promise`<{ `countConnected`: () => `Promise`<`number`\> ; `dispose`: () => `void` ; `event$`: `Observable`<{ `address`: `any` ; `message`: `Message` }\> ; `ping`: () => `Promise`<`Identity`\> ; `push`: (`label`: `string`, `data`: `Uint8Array`) => `Promise`<`void`\> ; `subscribe`: (`label`: `string`) => `void` ; `unsubscribe`: (`label`: `string`) => `void` }\>

RelayService connection

#### Defined in

[createRelayStream.ts:16](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createRelayStream.ts#L16)

---

### createSigner

▸ **createSigner**(`privateKey`, `providers`): `Wallet`

#### Parameters

| Name             | Type                                              |
| :--------------- | :------------------------------------------------ |
| `privateKey`     | `string`                                          |
| `providers`      | `Object`                                          |
| `providers.json` | `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` |
| `providers.ws`   | `undefined` \| `WebSocketProvider`                |

#### Returns

`Wallet`

#### Defined in

[createSigner.ts:4](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createSigner.ts#L4)

---

### createSnapshotClient

▸ **createSnapshotClient**(`url`): `ECSStateSnapshotServiceClient`

Create a ECSStateSnapshotServiceClient

#### Parameters

| Name  | Type     | Description                 |
| :---- | :------- | :-------------------------- |
| `url` | `string` | ECSStateSnapshotService URL |

#### Returns

`ECSStateSnapshotServiceClient`

ECSStateSnapshotServiceClient

#### Defined in

[workers/syncUtils.ts:46](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L46)

---

### createStreamClient

▸ **createStreamClient**(`url`): `ECSStreamServiceClient`

Create a ECSStreamServiceClient

#### Parameters

| Name  | Type     | Description          |
| :---- | :------- | :------------------- |
| `url` | `string` | ECSStreamService URL |

#### Returns

`ECSStreamServiceClient`

ECSStreamServiceClient

#### Defined in

[workers/syncUtils.ts:55](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L55)

---

### createSyncWorker

▸ **createSyncWorker**<`C`\>(`ack$?`, `options?`): `Object`

Create a new SyncWorker (Sync.worker.ts) to performn contract/client state sync.
The main thread and worker communicate via RxJS streams.

#### Type parameters

| Name | Type                                |
| :--- | :---------------------------------- |
| `C`  | extends `Components` = `Components` |

#### Parameters

| Name              | Type                                  |
| :---------------- | :------------------------------------ |
| `ack$?`           | `Observable`<[`Ack`](README.md#ack)\> |
| `options?`        | `Object`                              |
| `options.thread?` | `"worker"` \| `"main"`                |

#### Returns

`Object`

Object {
ecsEvent$: Stream of network component updates synced by the SyncWorker,
config$: RxJS subject to pass in config for the SyncWorker,
dispose: function to dispose of the sync worker
}

| Name         | Type                                               |
| :----------- | :------------------------------------------------- |
| `dispose`    | () => `void`                                       |
| `ecsEvents$` | `Subject`<[`NetworkEvent`](README.md#networkevent) |
| `input$`     | `Subject`<[`Input`](README.md#input)\>             |

#### Defined in

[createSyncWorker.ts:17](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createSyncWorker.ts#L17)

---

### createSystemExecutor

▸ **createSystemExecutor**<`T`\>(`world`, `network`, `systems`, `interfaces`, `gasPrice$`, `options?`): `Object`

Create a system executor object.
The system executor object is an object indexed by available system ids (given in the interfaces object)
with [tx-queue enabled system contracts](README.md#createtxqueue) as value.

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `T`  | extends `Object` |

#### Parameters

| Name                                  | Type                                                                                                                        | Description                                                                      |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `world`                               | `World`                                                                                                                     | Recs World object.                                                               |
| `network`                             | `Object`                                                                                                                    | Network ([createNetwork](README.md#createnetwork)).                              |
| `network.blockNumber$`                | `Observable`<`number`\>                                                                                                     | -                                                                                |
| `network.clock`                       | [`Clock`](README.md#clock)                                                                                                  | -                                                                                |
| `network.config`                      | [`NetworkConfig`](interfaces/NetworkConfig.md)                                                                              | -                                                                                |
| `network.connected`                   | `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\>                                                            | -                                                                                |
| `network.connectedAddress`            | `IComputedValue`<`undefined` \| `string`\>                                                                                  | -                                                                                |
| `network.connectedAddressChecksummed` | `IComputedValue`<`undefined` \| `string`\>                                                                                  | -                                                                                |
| `network.dispose`                     | () => `void`                                                                                                                | -                                                                                |
| `network.providers`                   | `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> | -                                                                                |
| `network.signer`                      | `IComputedValue`<`undefined` \| `Signer`\>                                                                                  | -                                                                                |
| `systems`                             | `Component`<{ `value`: `String` }, `Metadata`, `undefined`\>                                                                | Recs registry component containing the mapping from system address to system id. |
| `interfaces`                          | { [key in string \| number \| symbol]: ContractInterface }                                                                  | Interfaces of the systems to create.                                             |
| `gasPrice$`                           | `BehaviorSubject`<`number`\>                                                                                                | -                                                                                |
| `options?`                            | `Object`                                                                                                                    |                                                                                  |
| `options.concurrency?`                | `number`                                                                                                                    | -                                                                                |
| `options.devMode?`                    | `boolean`                                                                                                                   | -                                                                                |

#### Returns

`Object`

Systems object to call system contracts.

| Name                | Type                                                                          |
| :------------------ | :---------------------------------------------------------------------------- |
| `getSystemContract` | (`systemId`: `string`) => { `contract`: `Contract` ; `name`: `string` }       |
| `registerSystem`    | (`system`: { `contract`: `Contract` ; `id`: `string` }) => `Promise`<`void`\> |
| `systems`           | [`TxQueue`](README.md#txqueue)                                                |

#### Defined in

[createSystemExecutor.ts:22](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createSystemExecutor.ts#L22)

---

### createTopics

▸ **createTopics**<`C`\>(`config`): [`ContractTopics`](README.md#contracttopics)[]

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Parameters

| Name     | Type                                     |
| :------- | :--------------------------------------- |
| `config` | [`TopicsConfig`](README.md#topicsconfig) |

#### Returns

[`ContractTopics`](README.md#contracttopics)[]

#### Defined in

[createTopics.ts:12](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createTopics.ts#L12)

---

### createTransformWorldEventsFromStream

▸ **createTransformWorldEventsFromStream**(`decode`): (`message`: `ECSStreamBlockBundleReply`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

Create a function to transform World contract events from a stream service response chunk.

#### Parameters

| Name     | Type                                                                                                          | Description                                                                      |
| :------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| `decode` | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | Function to decode raw component values ([createDecode](README.md#createdecode)) |

#### Returns

`fn`

Function to transform World contract events from a stream service.

▸ (`message`): `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

##### Parameters

| Name      | Type                        |
| :-------- | :-------------------------- |
| `message` | `ECSStreamBlockBundleReply` |

##### Returns

`Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

#### Defined in

[workers/syncUtils.ts:467](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L467)

---

### createTxQueue

▸ **createTxQueue**<`C`\>(`computedContracts`, `network`, `gasPrice$`, `options?`): `Object`

The TxQueue takes care of nonce management, concurrency and caching calls if the contracts are not connected.
Cached calls are passed to the queue once the contracts are available.

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Parameters

| Name                                  | Type                                                                                                                        | Description                                                                                |
| :------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `computedContracts`                   | `IComputedValue`<`C`\> \| `IObservableValue`<`C`\>                                                                          | A computed object containing the contracts to be channelled through the txQueue            |
| `network`                             | `Object`                                                                                                                    | A network object containing provider, signer, etc                                          |
| `network.blockNumber$`                | `Observable`<`number`\>                                                                                                     | -                                                                                          |
| `network.clock`                       | [`Clock`](README.md#clock)                                                                                                  | -                                                                                          |
| `network.config`                      | [`NetworkConfig`](interfaces/NetworkConfig.md)                                                                              | -                                                                                          |
| `network.connected`                   | `IComputedValue`<[`ConnectionState`](enums/ConnectionState.md)\>                                                            | -                                                                                          |
| `network.connectedAddress`            | `IComputedValue`<`undefined` \| `string`\>                                                                                  | -                                                                                          |
| `network.connectedAddressChecksummed` | `IComputedValue`<`undefined` \| `string`\>                                                                                  | -                                                                                          |
| `network.dispose`                     | () => `void`                                                                                                                | -                                                                                          |
| `network.providers`                   | `IComputedValue`<{ `json`: `MUDJsonRpcBatchProvider` \| `MUDJsonRpcProvider` ; `ws`: `undefined` \| `WebSocketProvider` }\> | -                                                                                          |
| `network.signer`                      | `IComputedValue`<`undefined` \| `Signer`\>                                                                                  | -                                                                                          |
| `gasPrice$`                           | `BehaviorSubject`<`number`\>                                                                                                | -                                                                                          |
| `options?`                            | `Object`                                                                                                                    | The concurrency declares how many transactions can wait for confirmation at the same time. |
| `options.concurrency?`                | `number`                                                                                                                    | -                                                                                          |
| `options.devMode?`                    | `boolean`                                                                                                                   | -                                                                                          |

#### Returns

`Object`

TxQueue object

| Name      | Type                                        |
| :-------- | :------------------------------------------ |
| `dispose` | () => `void`                                |
| `ready`   | `IComputedValue`<`boolean` \| `undefined`\> |
| `txQueue` | [`TxQueue`](README.md#txqueue)              |

#### Defined in

[createTxQueue.ts:24](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createTxQueue.ts#L24)

---

### createWorldTopics

▸ **createWorldTopics**(): [`ContractTopics`](README.md#contracttopics)[]

Create World contract topics for the `ComponentValueSet` and `ComponentValueRemoved` events.

#### Returns

[`ContractTopics`](README.md#contracttopics)[]

World contract topics for the `ComponentValueSet` and `ComponentValueRemoved` events.

#### Defined in

[workers/syncUtils.ts:392](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L392)

---

### ensureNetworkIsUp

▸ **ensureNetworkIsUp**(`provider`, `wssProvider?`): `Promise`<`void`\>

Await network to be reachable.

#### Parameters

| Name           | Type                | Description              |
| :------------- | :------------------ | :----------------------- |
| `provider`     | `JsonRpcProvider`   | ethers JsonRpcProvider   |
| `wssProvider?` | `WebSocketProvider` | ethers WebSocketProvider |

#### Returns

`Promise`<`void`\>

Promise resolving once the network is reachable

#### Defined in

[networkUtils.ts:22](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/networkUtils.ts#L22)

---

### fetchBlock

▸ **fetchBlock**(`provider`, `requireMinimumBlockNumber?`): `Promise`<`Block`\>

Fetch the latest Ethereum block

#### Parameters

| Name                         | Type              | Description                                                                                                                                        |
| :--------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provider`                   | `JsonRpcProvider` | ethers JsonRpcProvider                                                                                                                             |
| `requireMinimumBlockNumber?` | `number`          | Minimal required block number. If the latest block number is below this number, the method waits for 1300ms and tries again, for at most 10 times. |

#### Returns

`Promise`<`Block`\>

Promise resolving with the latest Ethereum block

#### Defined in

[networkUtils.ts:38](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/networkUtils.ts#L38)

---

### fetchEventsInBlockRange

▸ **fetchEventsInBlockRange**<`C`\>(`provider`, `topics`, `startBlockNumber`, `endBlockNumber`, `contracts`, `supportsBatchQueries?`): `Promise`<[`ContractEvent`](README.md#contractevent)

Fetch events from block range, ordered by block, transaction index and log index

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Parameters

| Name                    | Type                                           | Description                                                      |
| :---------------------- | :--------------------------------------------- | :--------------------------------------------------------------- |
| `provider`              | `JsonRpcProvider`                              | ethers JsonRpcProvider                                           |
| `topics`                | [`ContractTopics`](README.md#contracttopics)[] | Topics to fetch events for                                       |
| `startBlockNumber`      | `number`                                       | Start of block range to fetch events from (inclusive)            |
| `endBlockNumber`        | `number`                                       | End of block range to fetch events from (inclusive)              |
| `contracts`             | [`ContractsConfig`](README.md#contractsconfig) | Contracts to fetch events from                                   |
| `supportsBatchQueries?` | `boolean`                                      | Set to true if the provider supports batch queries (recommended) |

#### Returns

`Promise`<[`ContractEvent`](README.md#contractevent)

Promise resolving with an array of ContractEvents

#### Defined in

[networkUtils.ts:143](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/networkUtils.ts#L143)

---

### fetchEventsInBlockRangeChunked

▸ **fetchEventsInBlockRangeChunked**(`fetchWorldEvents`, `boundFetchStoreEvents`, `fromBlockNumber`, `toBlockNumber`, `interval?`, `setPercentage?`): `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

Fetch ECS events from contracts in the given block range.

#### Parameters

| Name                    | Type                                                                                                                   | Default value | Description                                                                                                                           |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| `fetchWorldEvents`      | (`from`: `number`, `to`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)           | `undefined`   | Function to fetch World events in a block range ([createFetchWorldEventsInBlockRange](README.md#createfetchworldeventsinblockrange)). |
| `boundFetchStoreEvents` | (`fromBlock`: `number`, `toBlock`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate) | `undefined`   | -                                                                                                                                     |
| `fromBlockNumber`       | `number`                                                                                                               | `undefined`   | Start of block range (inclusive).                                                                                                     |
| `toBlockNumber`         | `number`                                                                                                               | `undefined`   | End of block range (inclusive).                                                                                                       |
| `interval`              | `number`                                                                                                               | `50`          | Chunk fetching the blocks in intervals to avoid overwhelming the client.                                                              |
| `setPercentage?`        | (`percentage`: `number`) => `void`                                                                                     | `undefined`   | -                                                                                                                                     |

#### Returns

`Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

Promise resolving with array containing the contract ECS events in the given block range.

#### Defined in

[workers/syncUtils.ts:298](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L298)

---

### fetchLogs

▸ **fetchLogs**<`C`\>(`provider`, `topics`, `startBlockNumber`, `endBlockNumber`, `contracts`, `requireMinimumBlockNumber?`): `Promise`<`Log`[]\>

Fetch logs with the given topics from a given block range.

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `C`  | extends [`Contracts`](README.md#contracts) |

#### Parameters

| Name                         | Type                                           | Description                                         |
| :--------------------------- | :--------------------------------------------- | :-------------------------------------------------- |
| `provider`                   | `JsonRpcProvider`                              | ethers JsonRpcProvider                              |
| `topics`                     | [`ContractTopics`](README.md#contracttopics)[] | Topics to fetch logs for                            |
| `startBlockNumber`           | `number`                                       | Start of block range to fetch logs from (inclusive) |
| `endBlockNumber`             | `number`                                       | End of block range to fetch logs from (inclusive)   |
| `contracts`                  | [`ContractsConfig`](README.md#contractsconfig) | Contracts to fetch logs from                        |
| `requireMinimumBlockNumber?` | `number`                                       | Minimal block number required to fetch blocks       |

#### Returns

`Promise`<`Log`[]\>

Promise resolving with an array of logs from the specified block range and topics

#### Defined in

[networkUtils.ts:70](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/networkUtils.ts#L70)

---

### fetchSnapshot

▸ **fetchSnapshot**(`snapshotClient`, `worldAddress`, `decode`): `Promise`<[`CacheStore`](README.md#cachestore)\>

Load from the remote snapshot service.

**`Deprecated`**

this util will be removed in a future version, use fetchSnapshotChunked instead

#### Parameters

| Name             | Type                                                                                                          | Description                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `snapshotClient` | `ECSStateSnapshotServiceClient`<{}\>                                                                          | ECSStateSnapshotServiceClient                                                     |
| `worldAddress`   | `string`                                                                                                      | Address of the World contract to get the snapshot for.                            |
| `decode`         | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | Function to decode raw component values ([createDecode](README.md#createdecode)). |

#### Returns

`Promise`<[`CacheStore`](README.md#cachestore)\>

Promise resolving with [CacheStore](README.md#cachestore) containing the snapshot state.

#### Defined in

[workers/syncUtils.ts:90](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L90)

---

### fetchSnapshotChunked

▸ **fetchSnapshotChunked**(`snapshotClient`, `worldAddress`, `decode`, `numChunks?`, `setPercentage?`, `pruneOptions?`): `Promise`<[`CacheStore`](README.md#cachestore)\>

Load from the remote snapshot service in chunks via a stream.

#### Parameters

| Name                             | Type                                                                                                          | Default value | Description                                                                       |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------ | :-------------------------------------------------------------------------------- |
| `snapshotClient`                 | `ECSStateSnapshotServiceClient`<{}\>                                                                          | `undefined`   | ECSStateSnapshotServiceClient                                                     |
| `worldAddress`                   | `string`                                                                                                      | `undefined`   | Address of the World contract to get the snapshot for.                            |
| `decode`                         | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | `undefined`   | Function to decode raw component values ([createDecode](README.md#createdecode)). |
| `numChunks`                      | `number`                                                                                                      | `10`          | -                                                                                 |
| `setPercentage?`                 | (`percentage`: `number`) => `void`                                                                            | `undefined`   | -                                                                                 |
| `pruneOptions?`                  | `Object`                                                                                                      | `undefined`   | -                                                                                 |
| `pruneOptions.hashedComponentId` | `string`                                                                                                      | `undefined`   | -                                                                                 |
| `pruneOptions.playerAddress`     | `string`                                                                                                      | `undefined`   | -                                                                                 |

#### Returns

`Promise`<[`CacheStore`](README.md#cachestore)\>

Promise resolving with [CacheStore](README.md#cachestore) containing the snapshot state.

#### Defined in

[workers/syncUtils.ts:115](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L115)

---

### fetchStateInBlockRange

▸ **fetchStateInBlockRange**(`fetchWorldEvents`, `boundFetchStoreEvents`, `fromBlockNumber`, `toBlockNumber`, `interval?`, `setPercentage?`): `Promise`<[`CacheStore`](README.md#cachestore)\>

Fetch ECS state from contracts in the given block range.

#### Parameters

| Name                    | Type                                                                                                                   | Default value | Description                                                                                                                           |
| :---------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| `fetchWorldEvents`      | (`from`: `number`, `to`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)           | `undefined`   | Function to fetch World events in a block range ([createFetchWorldEventsInBlockRange](README.md#createfetchworldeventsinblockrange)). |
| `boundFetchStoreEvents` | (`fromBlock`: `number`, `toBlock`: `number`) => `Promise`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate) | `undefined`   | -                                                                                                                                     |
| `fromBlockNumber`       | `number`                                                                                                               | `undefined`   | Start of block range (inclusive).                                                                                                     |
| `toBlockNumber`         | `number`                                                                                                               | `undefined`   | End of block range (inclusive).                                                                                                       |
| `interval`              | `number`                                                                                                               | `50`          | Chunk fetching the blocks in intervals to avoid overwhelming the client.                                                              |
| `setPercentage?`        | (`percentage`: `number`) => `void`                                                                                     | `undefined`   | -                                                                                                                                     |

#### Returns

`Promise`<[`CacheStore`](README.md#cachestore)\>

Promise resolving with [CacheStore](README.md#cachestore) containing the contract ECS state in the given block range.

#### Defined in

[workers/syncUtils.ts:334](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L334)

---

### flattenValue

▸ **flattenValue**<`V`\>(`value`, `valueType`): [`ContractSchemaValueTypes`](README.md#contractschemavaluetypes)[`V`]

#### Type parameters

| Name | Type                                                          |
| :--- | :------------------------------------------------------------ |
| `V`  | extends [`ContractSchemaValue`](enums/ContractSchemaValue.md) |

#### Parameters

| Name        | Type                                                                                                         |
| :---------- | :----------------------------------------------------------------------------------------------------------- |
| `value`     | `string` \| `number` \| `boolean` \| `string`[] \| `number`[] \| `BigNumber` \| `BigNumber`[] \| `boolean`[] |
| `valueType` | `V`                                                                                                          |

#### Returns

[`ContractSchemaValueTypes`](README.md#contractschemavaluetypes)[`V`]

#### Defined in

[createDecoder.ts:10](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/createDecoder.ts#L10)

---

### getCacheId

▸ **getCacheId**(`namespace`, `chainId`, `worldAddress`): `string`

#### Parameters

| Name           | Type     |
| :------------- | :------- |
| `namespace`    | `string` |
| `chainId`      | `number` |
| `worldAddress` | `string` |

#### Returns

`string`

#### Defined in

[workers/CacheStore.ts:15](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L15)

---

### getCacheStoreEntries

▸ **getCacheStoreEntries**<`Cm`\>(`«destructured»`): `IterableIterator`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `Cm` | extends `Components` |

#### Parameters

| Name                 | Type                       |
| :------------------- | :------------------------- |
| `«destructured»`     | `Object`                   |
| › `blockNumber`      | `number`                   |
| › `componentToIndex` | `Map`<`string`, `number`\> |
| › `components`       | `string`[]                 |
| › `entities`         | `string`[]                 |
| › `entityToIndex`    | `Map`<`string`, `number`\> |
| › `state`            | [`State`](README.md#state) |

#### Returns

`IterableIterator`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)

#### Defined in

[workers/CacheStore.ts:88](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L88)

---

### getIndexDBCacheStoreBlockNumber

▸ **getIndexDBCacheStoreBlockNumber**(`cache`): `Promise`<`number`\>

#### Parameters

| Name            | Type                                                                                                                                                                                                                                                     |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`         | `Object`                                                                                                                                                                                                                                                 |
| `cache.db`      | `IDBDatabase`                                                                                                                                                                                                                                            |
| `cache.entries` | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<[`string`, `S`[`Store`]]\>\>                                                                                                                                                                  |
| `cache.get`     | <Store\>(`store`: `Store`, `key`: `string`) => `Promise`<`S`[`Store`] \| `undefined`\>                                                                                                                                                                   |
| `cache.keys`    | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>) => `Promise`<`IterableIterator`                                                               |
| `cache.remove`  | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>, `key`: `string`) => `Promise`                                                                 |
| `cache.set`     | <Store\>(`store`: `Store`, `key`: `string`, `value`: { `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }[`Store`], `ignoreResult`: `boolean`) => `undefined` \| `Promise` |
| `cache.values`  | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<`S`[`Store`]\>\>                                                                                                                                                                              |

#### Returns

`Promise`<`number`\>

#### Defined in

[workers/CacheStore.ts:164](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L164)

---

### getIndexDbECSCache

▸ **getIndexDbECSCache**(`chainId`, `worldAddress`, `version?`, `idb?`): `Promise`<{ `db`: `IDBDatabase` ; `entries`: <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<[`string`, `S`[`Store`]]\>\> ; `get`: <Store\>(`store`: `Store`, `key`: `string`) => `Promise`<`S`[`Store`] \| `undefined`\> ; `keys`: (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>) => `Promise`<`IterableIterator`<`string`\>\> ; `remove`: (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>, `key`: `string`) => `Promise`<`void`\> ; `set`: <Store\>(`store`: `Store`, `key`: `string`, `value`: { `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }[`Store`], `ignoreResult`: `boolean`) => `undefined` \| `Promise`<`void`\> ; `values`: <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`

#### Parameters

| Name           | Type         |
| :------------- | :----------- |
| `chainId`      | `number`     |
| `worldAddress` | `string`     |
| `version?`     | `number`     |
| `idb?`         | `IDBFactory` |

#### Returns

`Promise`<{ `db`: `IDBDatabase` ; `entries`: <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<[`string`, `S`[`Store`]]\>\> ; `get`: <Store\>(`store`: `Store`, `key`: `string`) => `Promise`<`S`[`Store`] \| `undefined`\> ; `keys`: (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>) => `Promise`<`IterableIterator`<`string`\>\> ; `remove`: (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>, `key`: `string`) => `Promise`<`void`\> ; `set`: <Store\>(`store`: `Store`, `key`: `string`, `value`: { `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }[`Store`], `ignoreResult`: `boolean`) => `undefined` \| `Promise`<`void`\> ; `values`: <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`

#### Defined in

[workers/CacheStore.ts:168](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L168)

---

### getRevertReason

▸ **getRevertReason**(`txHash`, `provider`): `Promise`<`string`\>

Get the revert reason from a given transaction hash

#### Parameters

| Name       | Type           | Description                                    |
| :--------- | :------------- | :--------------------------------------------- |
| `txHash`   | `string`       | Transaction hash to get the revert reason from |
| `provider` | `BaseProvider` | ethers Provider                                |

#### Returns

`Promise`<`string`\>

Promise resolving with revert reason string

#### Defined in

[networkUtils.ts:230](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/networkUtils.ts#L230)

---

### getSnapshotBlockNumber

▸ **getSnapshotBlockNumber**(`snapshotClient`, `worldAddress`): `Promise`<`number`\>

Return the snapshot block number.

#### Parameters

| Name             | Type                                                | Description                                            |
| :--------------- | :-------------------------------------------------- | :----------------------------------------------------- |
| `snapshotClient` | `undefined` \| `ECSStateSnapshotServiceClient`<{}\> | ECSStateSnapshotServiceClient                          |
| `worldAddress`   | `string`                                            | Address of the World contract to get the snapshot for. |

#### Returns

`Promise`<`number`\>

Snapsot block number

#### Defined in

[workers/syncUtils.ts:66](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L66)

---

### isNetworkComponentUpdateEvent

▸ **isNetworkComponentUpdateEvent**<`C`\>(`e`): e is NetworkComponentUpdate<C\>

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

#### Parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `e`  | [`NetworkEvent`](README.md#networkevent) |

#### Returns

e is NetworkComponentUpdate<C\>

#### Defined in

[types.ts:127](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L127)

---

### isSystemCallEvent

▸ **isSystemCallEvent**<`C`\>(`e`): e is SystemCall<C\>

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

#### Parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `e`  | [`NetworkEvent`](README.md#networkevent) |

#### Returns

e is SystemCall<C\>

#### Defined in

[types.ts:123](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/types.ts#L123)

---

### loadIndexDbCacheStore

▸ **loadIndexDbCacheStore**(`cache`): `Promise`<[`CacheStore`](README.md#cachestore)\>

#### Parameters

| Name            | Type                                                                                                                                                                                                                                                     |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`         | `Object`                                                                                                                                                                                                                                                 |
| `cache.db`      | `IDBDatabase`                                                                                                                                                                                                                                            |
| `cache.entries` | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<[`string`, `S`[`Store`]]\>\>                                                                                                                                                                  |
| `cache.get`     | <Store\>(`store`: `Store`, `key`: `string`) => `Promise`<`S`[`Store`] \| `undefined`\>                                                                                                                                                                   |
| `cache.keys`    | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>) => `Promise`<`IterableIterator`                                                               |
| `cache.remove`  | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>, `key`: `string`) => `Promise`                                                                 |
| `cache.set`     | <Store\>(`store`: `Store`, `key`: `string`, `value`: { `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }[`Store`], `ignoreResult`: `boolean`) => `undefined` \| `Promise` |
| `cache.values`  | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<`S`[`Store`]\>\>                                                                                                                                                                              |

#### Returns

`Promise`<[`CacheStore`](README.md#cachestore)\>

#### Defined in

[workers/CacheStore.ts:143](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L143)

---

### mergeCacheStores

▸ **mergeCacheStores**(`stores`): [`CacheStore`](README.md#cachestore)

#### Parameters

| Name     | Type                                                                                                                                                                                                                   |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stores` | { `blockNumber`: `number` ; `componentToIndex`: `Map`<`string`, `number`\> ; `components`: `string`[] ; `entities`: `string`[] ; `entityToIndex`: `Map`<`string`, `number`\> ; `state`: [`State`](README.md#state) }[] |

#### Returns

[`CacheStore`](README.md#cachestore)

#### Defined in

[workers/CacheStore.ts:117](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L117)

---

### messagePayload

▸ **messagePayload**(`msg`): `string`

#### Parameters

| Name  | Type      |
| :---- | :-------- |
| `msg` | `Message` |

#### Returns

`string`

#### Defined in

[utils.ts:8](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/utils.ts#L8)

---

### normalizeComponentID

▸ **normalizeComponentID**(`componentID`): `string`

#### Parameters

| Name          | Type                    |
| :------------ | :---------------------- |
| `componentID` | `string` \| `BigNumber` |

#### Returns

`string`

#### Defined in

[utils.ts:30](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/utils.ts#L30)

---

### normalizeEntityID

▸ **normalizeEntityID**(`entityID`): `EntityID`

#### Parameters

| Name       | Type                                  |
| :--------- | :------------------------------------ |
| `entityID` | `string` \| `BigNumber` \| `EntityID` |

#### Returns

`EntityID`

#### Defined in

[utils.ts:15](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/utils.ts#L15)

---

### parseSystemCallsFromStreamEvents

▸ **parseSystemCallsFromStreamEvents**(`events`): [`SystemCall`](README.md#systemcall)[]

#### Parameters

| Name     | Type                                                           |
| :------- | :------------------------------------------------------------- |
| `events` | [`NetworkComponentUpdate`](README.md#networkcomponentupdate)[] |

#### Returns

[`SystemCall`](README.md#systemcall)[]

#### Defined in

[workers/syncUtils.ts:531](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L531)

---

### reduceFetchedState

▸ **reduceFetchedState**(`response`, `cacheStore`, `decode`): `Promise`<`void`\>

Reduces a snapshot response by storing corresponding ECS events into the cache store.

**`Deprecated`**

this util will be removed in a future version, use reduceFetchedStateV2 instead

#### Parameters

| Name                          | Type                                                                                                          | Description                                                                       |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `response`                    | `ECSStateReply`                                                                                               | ECSStateReply                                                                     |
| `cacheStore`                  | `Object`                                                                                                      | [CacheStore](README.md#cachestore) to store snapshot state into.                  |
| `cacheStore.blockNumber`      | `number`                                                                                                      | -                                                                                 |
| `cacheStore.componentToIndex` | `Map`<`string`, `number`\>                                                                                    | -                                                                                 |
| `cacheStore.components`       | `string`[]                                                                                                    | -                                                                                 |
| `cacheStore.entities`         | `string`[]                                                                                                    | -                                                                                 |
| `cacheStore.entityToIndex`    | `Map`<`string`, `number`\>                                                                                    | -                                                                                 |
| `cacheStore.state`            | [`State`](README.md#state)                                                                                    | -                                                                                 |
| `decode`                      | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | Function to decode raw component values ([createDecode](README.md#createdecode)). |

#### Returns

`Promise`<`void`\>

Promise resolving once state is reduced into [CacheStore](README.md#cachestore).

#### Defined in

[workers/syncUtils.ts:160](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L160)

---

### reduceFetchedStateV2

▸ **reduceFetchedStateV2**(`response`, `cacheStore`, `decode`): `Promise`<`void`\>

Reduces a snapshot response by storing corresponding ECS events into the cache store.

#### Parameters

| Name                          | Type                                                                                                          | Description                                                                       |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `response`                    | `ECSStateReplyV2`                                                                                             | ECSStateReplyV2                                                                   |
| `cacheStore`                  | `Object`                                                                                                      | [CacheStore](README.md#cachestore) to store snapshot state into.                  |
| `cacheStore.blockNumber`      | `number`                                                                                                      | -                                                                                 |
| `cacheStore.componentToIndex` | `Map`<`string`, `number`\>                                                                                    | -                                                                                 |
| `cacheStore.components`       | `string`[]                                                                                                    | -                                                                                 |
| `cacheStore.entities`         | `string`[]                                                                                                    | -                                                                                 |
| `cacheStore.entityToIndex`    | `Map`<`string`, `number`\>                                                                                    | -                                                                                 |
| `cacheStore.state`            | [`State`](README.md#state)                                                                                    | -                                                                                 |
| `decode`                      | (`componentId`: `string`, `data`: `BytesLike`, `componentAddress?`: `string`) => `Promise`<`ComponentValue`\> | Function to decode raw component values ([createDecode](README.md#createdecode)). |

#### Returns

`Promise`<`void`\>

Promise resolving once state is reduced into [CacheStore](README.md#cachestore).

#### Defined in

[workers/syncUtils.ts:183](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/syncUtils.ts#L183)

---

### saveCacheStoreToIndexDb

▸ **saveCacheStoreToIndexDb**(`cache`, `store`): `Promise`<`void`\>

#### Parameters

| Name                     | Type                                                                                                                                                                                                                                                     |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cache`                  | `Object`                                                                                                                                                                                                                                                 |
| `cache.db`               | `IDBDatabase`                                                                                                                                                                                                                                            |
| `cache.entries`          | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<[`string`, `S`[`Store`]]\>\>                                                                                                                                                                  |
| `cache.get`              | <Store\>(`store`: `Store`, `key`: `string`) => `Promise`<`S`[`Store`] \| `undefined`\>                                                                                                                                                                   |
| `cache.keys`             | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>) => `Promise`<`IterableIterator`                                                               |
| `cache.remove`           | (`store`: `StoreKey`<{ `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }\>, `key`: `string`) => `Promise`                                                                 |
| `cache.set`              | <Store\>(`store`: `Store`, `key`: `string`, `value`: { `BlockNumber`: `number` ; `ComponentValues`: [`State`](README.md#state) ; `Mappings`: `string`[] ; `Snapshot`: `ECSStateReply` }[`Store`], `ignoreResult`: `boolean`) => `undefined` \| `Promise` |
| `cache.values`           | <Store\>(`store`: `Store`) => `Promise`<`IterableIterator`<`S`[`Store`]\>\>                                                                                                                                                                              |
| `store`                  | `Object`                                                                                                                                                                                                                                                 |
| `store.blockNumber`      | `number`                                                                                                                                                                                                                                                 |
| `store.componentToIndex` | `Map`<`string`, `number`\>                                                                                                                                                                                                                               |
| `store.components`       | `string`[]                                                                                                                                                                                                                                               |
| `store.entities`         | `string`[]                                                                                                                                                                                                                                               |
| `store.entityToIndex`    | `Map`<`string`, `number`\>                                                                                                                                                                                                                               |
| `store.state`            | [`State`](README.md#state)                                                                                                                                                                                                                               |

#### Returns

`Promise`<`void`\>

#### Defined in

[workers/CacheStore.ts:135](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L135)

---

### storeEvent

▸ **storeEvent**<`Cm`\>(`cacheStore`, `«destructured»`): `void`

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `Cm` | extends `Components` |

#### Parameters

| Name                          | Type                                                                |
| :---------------------------- | :------------------------------------------------------------------ |
| `cacheStore`                  | `Object`                                                            |
| `cacheStore.blockNumber`      | `number`                                                            |
| `cacheStore.componentToIndex` | `Map`<`string`, `number`\>                                          |
| `cacheStore.components`       | `string`[]                                                          |
| `cacheStore.entities`         | `string`[]                                                          |
| `cacheStore.entityToIndex`    | `Map`<`string`, `number`\>                                          |
| `cacheStore.state`            | [`State`](README.md#state)                                          |
| `«destructured»`              | `Omit`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate) |

#### Returns

`void`

#### Defined in

[workers/CacheStore.ts:30](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L30)

---

### storeEvents

▸ **storeEvents**<`Cm`\>(`cacheStore`, `events`): `void`

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `Cm` | extends `Components` |

#### Parameters

| Name                          | Type                                                                  |
| :---------------------------- | :-------------------------------------------------------------------- |
| `cacheStore`                  | `Object`                                                              |
| `cacheStore.blockNumber`      | `number`                                                              |
| `cacheStore.componentToIndex` | `Map`<`string`, `number`\>                                            |
| `cacheStore.components`       | `string`[]                                                            |
| `cacheStore.entities`         | `string`[]                                                            |
| `cacheStore.entityToIndex`    | `Map`<`string`, `number`\>                                            |
| `cacheStore.state`            | [`State`](README.md#state)                                            |
| `events`                      | `Omit`<[`NetworkComponentUpdate`](README.md#networkcomponentupdate)[] |

#### Returns

`void`

#### Defined in

[workers/CacheStore.ts:79](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/CacheStore.ts#L79)
