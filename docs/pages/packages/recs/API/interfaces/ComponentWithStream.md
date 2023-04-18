[@latticexyz/recs](../README.md) / ComponentWithStream

# Interface: ComponentWithStream

Type of component returned by [defineComponent](../README.md#definecomponent).

## Type parameters

| Name | Type                                    |
| :--- | :-------------------------------------- |
| `S`  | extends [`Schema`](../README.md#schema) |
| `T`  | `undefined`                             |

## Hierarchy

- [`Component`](Component.md)<`S`, [`Metadata`](../README.md#metadata), `T`\>

  ↳ **`ComponentWithStream`**

## Table of contents

### Properties

- [entities](ComponentWithStream.md#entities)
- [id](ComponentWithStream.md#id)
- [metadata](ComponentWithStream.md#metadata)
- [schema](ComponentWithStream.md#schema)
- [stream$](ComponentWithStream.md#stream$)
- [update$](ComponentWithStream.md#update$)
- [values](ComponentWithStream.md#values)
- [world](ComponentWithStream.md#world)

## Properties

### entities

• **entities**: () => `IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

#### Type declaration

▸ (): `IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

##### Returns

`IterableIterator`<[`EntityIndex`](../README.md#entityindex)\>

#### Inherited from

[Component](Component.md).[entities](Component.md#entities)

#### Defined in

[types.ts:82](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L82)

---

### id

• **id**: `string`

#### Inherited from

[Component](Component.md).[id](Component.md#id)

#### Defined in

[types.ts:78](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L78)

---

### metadata

• **metadata**: [`Metadata`](../README.md#metadata)

#### Inherited from

[Component](Component.md).[metadata](Component.md#metadata)

#### Defined in

[types.ts:81](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L81)

---

### schema

• **schema**: `S`

#### Inherited from

[Component](Component.md).[schema](Component.md#schema)

#### Defined in

[types.ts:80](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L80)

---

### stream$

• **stream$**: `Subject`<{ `entity`: [`EntityIndex`](../README.md#entityindex) ; `value`: `undefined` \| [`ComponentValue`](../README.md#componentvalue)

#### Defined in

[types.ts:100](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L100)

---

### update$

• **update$**: `Subject`<[`ComponentUpdate`](../README.md#componentupdate) & { `observers`: `any` }

#### Inherited from

[Component](Component.md).[update$](Component.md#update$)

#### Defined in

[types.ts:85](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L85)

---

### values

• **values**: { [key in string \| number \| symbol]: Map<EntityIndex, ValueType<T\>[S[key]]\> }

#### Inherited from

[Component](Component.md).[values](Component.md#values)

#### Defined in

[types.ts:79](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L79)

---

### world

• **world**: [`World`](../README.md#world)

#### Inherited from

[Component](Component.md).[world](Component.md#world)

#### Defined in

[types.ts:83](https://github.com/latticexyz/mud/blob/28a579f35/packages/recs/src/types.ts#L83)
