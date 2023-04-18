[@latticexyz/network](../README.md) / SyncWorker

# Class: SyncWorker

## Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

## Implements

- `DoWork`<[`Input`](../README.md#input), [`NetworkEvent`](../README.md#networkevent)

## Table of contents

### Constructors

- [constructor](SyncWorker.md#constructor)

### Properties

- [input$](SyncWorker.md#input$)
- [output$](SyncWorker.md#output$)
- [syncState](SyncWorker.md#syncstate)

### Methods

- [init](SyncWorker.md#init)
- [setLoadingState](SyncWorker.md#setloadingstate)
- [work](SyncWorker.md#work)

## Constructors

### constructor

• **new SyncWorker**<`C`\>()

#### Type parameters

| Name | Type                 |
| :--- | :------------------- |
| `C`  | extends `Components` |

#### Defined in

[workers/SyncWorker.ts:74](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L74)

## Properties

### input$

• `Private` **input$**: `Subject`<[`Input`](../README.md#input)\>

#### Defined in

[workers/SyncWorker.ts:70](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L70)

---

### output$

• `Private` **output$**: `Subject`<[`NetworkEvent`](../README.md#networkevent)

#### Defined in

[workers/SyncWorker.ts:71](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L71)

---

### syncState

• `Private` **syncState**: [`SyncStateStruct`](../README.md#syncstatestruct)

#### Defined in

[workers/SyncWorker.ts:72](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L72)

## Methods

### init

▸ `Private` **init**(): `Promise`<`void`\>

Start the sync process.

1. Get config
2. Load initial state
   2.1 Get cache block number
   2.2 Get snapshot block number
   2.3 Load from more recent source
3. Cach up to current block number by requesting events from RPC ( -> TODO: Replace with own service)
4. Keep in sync
   4.1 If available keep in sync with streaming service
   4.2 Else keep in sync with RPC

#### Returns

`Promise`<`void`\>

#### Defined in

[workers/SyncWorker.ts:121](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L121)

---

### setLoadingState

▸ `Private` **setLoadingState**(`loadingState`, `blockNumber?`): `void`

Pass a loading state component update to the main thread.
Can be used to indicate the initial loading state on a loading screen.

#### Parameters

| Name           | Type                                                                                                     | Default value | Description                                                                                                                                                              |
| :------------- | :------------------------------------------------------------------------------------------------------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadingState` | `Partial`<{ `msg`: `string` ; `percentage`: `number` ; `state`: [`SyncState`](../enums/SyncState.md) }\> | `undefined`   | { state: [SyncState](../enums/SyncState.md), msg: Message to describe the current loading step. percentage: Number between 0 and 100 to describe the loading progress. } |
| `blockNumber`  | `number`                                                                                                 | `0`           | Optional: block number to pass in the component update.                                                                                                                  |

#### Returns

`void`

#### Defined in

[workers/SyncWorker.ts:89](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L89)

---

### work

▸ **work**(`input$`): `Observable`<[`NetworkEvent`](../README.md#networkevent)

#### Parameters

| Name     | Type                                         |
| :------- | :------------------------------------------- |
| `input$` | `Observable`<[`Input`](../README.md#input)\> |

#### Returns

`Observable`<[`NetworkEvent`](../README.md#networkevent)

#### Implementation of

DoWork.work

#### Defined in

[workers/SyncWorker.ts:321](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/network/src/workers/SyncWorker.ts#L321)
