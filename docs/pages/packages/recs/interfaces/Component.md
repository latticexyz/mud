[@latticexyz/recs](../README.md) / Component

# Interface: Component

Type of component returned by [defineComponent](../README.md#definecomponent).

## Type parameters

| Name | Type                                                                              |
| :--- | :-------------------------------------------------------------------------------- |
| `S`  | extends [`Schema`](../README.md#schema) = [`Schema`](../README.md#schema)         |
| `M`  | extends [`Metadata`](../README.md#metadata) = [`Metadata`](../README.md#metadata) |
| `T`  | `undefined`                                                                       |

## Hierarchy

- **`Component`**

  ↳ [`ComponentWithStream`](ComponentWithStream.md)

## Table of contents

### Properties

- [entities](Component.md#entities)
- [id](Component.md#id)
- [metadata](Component.md#metadata)
- [schema](Component.md#schema)
- [update$](Component.md#update$)
- [values](Component.md#values)
- [world](Component.md#world)

## Properties

### entities

• **entities**: () => `IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

#### Type declaration

▸ (): `IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

##### Returns

`IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

#### Defined in

[types.ts:82](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L82)

---

### id

• **id**: `string`

#### Defined in

[types.ts:78](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L78)

---

### metadata

• **metadata**: `M`

#### Defined in

[types.ts:81](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L81)

---

### schema

• **schema**: `S`

#### Defined in

[types.ts:80](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L80)

---

### update$

• **update$**: `Subject`<[`ComponentUpdate`](../README.md#componentupdate) & { `observers`: `any` }

#### Defined in

[types.ts:85](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L85)

---

### values

• **values**: { [key in string \| number \| symbol]: Map<EntityIndex, ValueType<T\>[S[key]]\> }

#### Defined in

[types.ts:79](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L79)

---

### world

• **world**: [`World`](../README.md#world)

#### Defined in

[types.ts:83](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L83)
