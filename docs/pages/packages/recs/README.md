@latticexyz/recs

# @latticexyz/recs

## Table of contents

### Enumerations

- [QueryFragmentType](enums/QueryFragmentType.md)
- [Type](enums/Type.md)
- [UpdateType](enums/UpdateType.md)

### Interfaces

- [Component](interfaces/Component.md)
- [ComponentWithStream](interfaces/ComponentWithStream.md)

### Type Aliases

- [AnyComponent](README.md#anycomponent)
- [AnyComponentValue](README.md#anycomponentvalue)
- [ArrayType](README.md#arraytype)
- [ComponentUpdate](README.md#componentupdate)
- [ComponentValue](README.md#componentvalue)
- [Components](README.md#components)
- [EntityID](README.md#entityid)
- [EntityIndex](README.md#entityindex)
- [EntityQueryFragment](README.md#entityqueryfragment)
- [EntityType](README.md#entitytype)
- [HasQueryFragment](README.md#hasqueryfragment)
- [HasValueQueryFragment](README.md#hasvaluequeryfragment)
- [Indexer](README.md#indexer)
- [Layer](README.md#layer)
- [Layers](README.md#layers)
- [Metadata](README.md#metadata)
- [NotQueryFragment](README.md#notqueryfragment)
- [NotValueQueryFragment](README.md#notvaluequeryfragment)
- [NumberType](README.md#numbertype)
- [OptionalType](README.md#optionaltype)
- [OverridableComponent](README.md#overridablecomponent)
- [Override](README.md#override)
- [ProxyExpandQueryFragment](README.md#proxyexpandqueryfragment)
- [ProxyReadQueryFragment](README.md#proxyreadqueryfragment)
- [QueryFragment](README.md#queryfragment)
- [QueryFragments](README.md#queryfragments)
- [Schema](README.md#schema)
- [SchemaOf](README.md#schemaof)
- [SettingQueryFragment](README.md#settingqueryfragment)
- [ValueType](README.md#valuetype)
- [World](README.md#world)

### Variables

- [OptionalTypes](README.md#optionaltypes)

### Functions

- [Has](README.md#has)
- [HasValue](README.md#hasvalue)
- [Not](README.md#not)
- [NotValue](README.md#notvalue)
- [ProxyExpand](README.md#proxyexpand)
- [ProxyRead](README.md#proxyread)
- [clearLocalCache](README.md#clearlocalcache)
- [componentValueEquals](README.md#componentvalueequals)
- [createEntity](README.md#createentity)
- [createIndexer](README.md#createindexer)
- [createLocalCache](README.md#createlocalcache)
- [createWorld](README.md#createworld)
- [defineComponent](README.md#definecomponent)
- [defineComponentSystem](README.md#definecomponentsystem)
- [defineEnterQuery](README.md#defineenterquery)
- [defineEnterSystem](README.md#defineentersystem)
- [defineExitQuery](README.md#defineexitquery)
- [defineExitSystem](README.md#defineexitsystem)
- [defineQuery](README.md#definequery)
- [defineRxSystem](README.md#definerxsystem)
- [defineSyncSystem](README.md#definesyncsystem)
- [defineSystem](README.md#definesystem)
- [defineUpdateQuery](README.md#defineupdatequery)
- [defineUpdateSystem](README.md#defineupdatesystem)
- [getChildEntities](README.md#getchildentities)
- [getComponentEntities](README.md#getcomponententities)
- [getComponentValue](README.md#getcomponentvalue)
- [getComponentValueStrict](README.md#getcomponentvaluestrict)
- [getEntitiesWithValue](README.md#getentitieswithvalue)
- [getEntityComponents](README.md#getentitycomponents)
- [hasComponent](README.md#hascomponent)
- [isArrayType](README.md#isarraytype)
- [isComponentUpdate](README.md#iscomponentupdate)
- [isEntityType](README.md#isentitytype)
- [isFullComponentValue](README.md#isfullcomponentvalue)
- [isIndexer](README.md#isindexer)
- [isNumberType](README.md#isnumbertype)
- [isOptionalType](README.md#isoptionaltype)
- [namespaceWorld](README.md#namespaceworld)
- [overridableComponent](README.md#overridablecomponent-1)
- [removeComponent](README.md#removecomponent)
- [runQuery](README.md#runquery)
- [setComponent](README.md#setcomponent)
- [toUpdate](README.md#toupdate)
- [toUpdateStream](README.md#toupdatestream)
- [updateComponent](README.md#updatecomponent)
- [withValue](README.md#withvalue)

## Type Aliases

### AnyComponent

Ƭ **AnyComponent**: [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema)\>

#### Defined in

[types.ts:105](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L105)

---

### AnyComponentValue

Ƭ **AnyComponentValue**: [`ComponentValue`](README.md#componentvalue)

#### Defined in

[types.ts:103](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L103)

---

### ArrayType

Ƭ **ArrayType**: [`NumberArray`](enums/Type.md#numberarray) \| [`OptionalNumberArray`](enums/Type.md#optionalnumberarray) \| [`BigIntArray`](enums/Type.md#bigintarray) \| [`OptionalBigIntArray`](enums/Type.md#optionalbigintarray) \| [`StringArray`](enums/Type.md#stringarray) \| [`OptionalStringArray`](enums/Type.md#optionalstringarray) \| [`EntityArray`](enums/Type.md#entityarray) \| [`OptionalEntityArray`](enums/Type.md#optionalentityarray)

#### Defined in

[types.ts:225](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L225)

---

### ComponentUpdate

Ƭ **ComponentUpdate**<`S`, `T`\>: `Object`

Type of a component update corresponding to a given [Schema](README.md#schema).

#### Type parameters

| Name | Type                                                                |
| :--- | :------------------------------------------------------------------ |
| `S`  | extends [`Schema`](README.md#schema) = [`Schema`](README.md#schema) |
| `T`  | `undefined`                                                         |

#### Type declaration

| Name        | Type                                                                                                                                  |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\>                                                   |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                                                                                |
| `value`     | [[`ComponentValue`](README.md#componentvalue)<`S`, `T`\> \| `undefined`, [`ComponentValue`](README.md#componentvalue) \| `undefined`] |

#### Defined in

[types.ts:68](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L68)

---

### ComponentValue

Ƭ **ComponentValue**<`S`, `T`\>: { [key in keyof S]: ValueType<T\>[S[key]] }

Used to infer the TypeScript type of a component value corresponding to a given [Schema](README.md#schema).

#### Type parameters

| Name | Type                                                                |
| :--- | :------------------------------------------------------------------ |
| `S`  | extends [`Schema`](README.md#schema) = [`Schema`](README.md#schema) |
| `T`  | `undefined`                                                         |

#### Defined in

[types.ts:61](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L61)

---

### Components

Ƭ **Components**: `Object`

#### Index signature

▪ [key: `string`]: [`Component`](interfaces/Component.md)

#### Defined in

[types.ts:95](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L95)

---

### EntityID

Ƭ **EntityID**: `Opaque`<`string`, `"EntityID"`\>

Used to refer to the string id of an entity (independent from a [World](README.md#world)).

#### Defined in

[types.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L13)

---

### EntityIndex

Ƭ **EntityIndex**: `Opaque`<`number`, `"EntityIndex"`\>

Used to refer to the index of an entity in a [World](README.md#world).

#### Defined in

[types.ts:8](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L8)

---

### EntityQueryFragment

Ƭ **EntityQueryFragment**<`T`\>: [`HasQueryFragment`](README.md#hasqueryfragment)<`T`\> \| [`HasValueQueryFragment`](README.md#hasvaluequeryfragment)<`T`\> \| [`NotQueryFragment`](README.md#notqueryfragment)<`T`\> \| [`NotValueQueryFragment`](README.md#notvaluequeryfragment)

#### Type parameters

| Name | Type                                                                |
| :--- | :------------------------------------------------------------------ |
| `T`  | extends [`Schema`](README.md#schema) = [`Schema`](README.md#schema) |

#### Defined in

[types.ts:173](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L173)

---

### EntityType

Ƭ **EntityType**: [`Entity`](enums/Type.md#entity) \| [`OptionalEntity`](enums/Type.md#optionalentity)

#### Defined in

[types.ts:253](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L253)

---

### HasQueryFragment

Ƭ **HasQueryFragment**<`T`\>: `Object`

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Type declaration

| Name        | Type                                         |
| :---------- | :------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`\> |
| `type`      | [`Has`](enums/QueryFragmentType.md#has)      |

#### Defined in

[types.ts:131](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L131)

---

### HasValueQueryFragment

Ƭ **HasValueQueryFragment**<`T`\>: `Object`

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Type declaration

| Name        | Type                                                   |
| :---------- | :----------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`\>           |
| `type`      | [`HasValue`](enums/QueryFragmentType.md#hasvalue)      |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue) |

#### Defined in

[types.ts:136](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L136)

---

### Indexer

Ƭ **Indexer**<`S`, `M`, `T`\>: [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> & { `getEntitiesWithValue`: (`value`: [`ComponentValue`](README.md#componentvalue)<`S`, `T`\>) => `Set` }

Type of indexer returned by [createIndexer](README.md#createindexer).

#### Type parameters

| Name | Type                                                                        |
| :--- | :-------------------------------------------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)                                        |
| `M`  | extends [`Metadata`](README.md#metadata) = [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                                                                 |

#### Defined in

[types.ts:91](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L91)

---

### Layer

Ƭ **Layer**: `Object`

#### Type declaration

| Name         | Type                                                                                       |
| :----------- | :----------------------------------------------------------------------------------------- |
| `components` | `Record`<`string`, [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema)\>\> |
| `world`      | [`World`](README.md#world)                                                                 |

#### Defined in

[types.ts:258](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L258)

---

### Layers

Ƭ **Layers**: `Record`<`string`, [`Layer`](README.md#layer)\>

#### Defined in

[types.ts:263](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L263)

---

### Metadata

Ƭ **Metadata**: { `[key: string]`: `unknown`; } \| `undefined`

Used to add arbitrary metadata to components.
(Eg `contractId` for components that have a corresponding solecs component contract.)

#### Defined in

[types.ts:27](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L27)

---

### NotQueryFragment

Ƭ **NotQueryFragment**<`T`\>: `Object`

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Type declaration

| Name        | Type                                         |
| :---------- | :------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`\> |
| `type`      | [`Not`](enums/QueryFragmentType.md#not)      |

#### Defined in

[types.ts:142](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L142)

---

### NotValueQueryFragment

Ƭ **NotValueQueryFragment**<`T`\>: `Object`

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Type declaration

| Name        | Type                                                   |
| :---------- | :----------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`\>           |
| `type`      | [`NotValue`](enums/QueryFragmentType.md#notvalue)      |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue) |

#### Defined in

[types.ts:147](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L147)

---

### NumberType

Ƭ **NumberType**: [`Number`](enums/Type.md#number) \| [`OptionalNumber`](enums/Type.md#optionalnumber)

#### Defined in

[types.ts:248](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L248)

---

### OptionalType

Ƭ **OptionalType**: [`OptionalNumber`](enums/Type.md#optionalnumber) \| [`OptionalBigInt`](enums/Type.md#optionalbigint) \| [`OptionalString`](enums/Type.md#optionalstring) \| [`OptionalEntity`](enums/Type.md#optionalentity) \| [`OptionalNumberArray`](enums/Type.md#optionalnumberarray) \| [`OptionalBigIntArray`](enums/Type.md#optionalbigintarray) \| [`OptionalStringArray`](enums/Type.md#optionalstringarray) \| [`OptionalEntityArray`](enums/Type.md#optionalentityarray)

#### Defined in

[types.ts:202](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L202)

---

### OverridableComponent

Ƭ **OverridableComponent**<`S`, `M`, `T`\>: [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> & { `addOverride`: (`overrideId`: `string`, `update`: [`Override`](README.md#override) `void` }

Type of overridable component returned by [overridableComponent](README.md#overridablecomponent-1).

#### Type parameters

| Name | Type                                                                        |
| :--- | :-------------------------------------------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) = [`Schema`](README.md#schema)         |
| `M`  | extends [`Metadata`](README.md#metadata) = [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                                                                 |

#### Defined in

[types.ts:193](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L193)

---

### Override

Ƭ **Override**<`S`, `T`\>: `Object`

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Type declaration

| Name     | Type                                                             |
| :------- | :--------------------------------------------------------------- |
| `entity` | [`EntityIndex`](README.md#entityindex)                           |
| `value`  | `Partial`<[`ComponentValue`](README.md#componentvalue) \| `null` |

#### Defined in

[types.ts:185](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L185)

---

### ProxyExpandQueryFragment

Ƭ **ProxyExpandQueryFragment**: `Object`

#### Type declaration

| Name        | Type                                                                                   |
| :---------- | :------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<{ `value`: [`Entity`](enums/Type.md#entity) }\> |
| `depth`     | `number`                                                                               |
| `type`      | [`ProxyExpand`](enums/QueryFragmentType.md#proxyexpand)                                |

#### Defined in

[types.ts:159](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L159)

---

### ProxyReadQueryFragment

Ƭ **ProxyReadQueryFragment**: `Object`

#### Type declaration

| Name        | Type                                                                                   |
| :---------- | :------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<{ `value`: [`Entity`](enums/Type.md#entity) }\> |
| `depth`     | `number`                                                                               |
| `type`      | [`ProxyRead`](enums/QueryFragmentType.md#proxyread)                                    |

#### Defined in

[types.ts:153](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L153)

---

### QueryFragment

Ƭ **QueryFragment**<`T`\>: [`HasQueryFragment`](README.md#hasqueryfragment)<`T`\> \| [`HasValueQueryFragment`](README.md#hasvaluequeryfragment)<`T`\> \| [`NotQueryFragment`](README.md#notqueryfragment)<`T`\> \| [`NotValueQueryFragment`](README.md#notvaluequeryfragment) \| [`ProxyReadQueryFragment`](README.md#proxyreadqueryfragment) \| [`ProxyExpandQueryFragment`](README.md#proxyexpandqueryfragment)

#### Type parameters

| Name | Type                                                                |
| :--- | :------------------------------------------------------------------ |
| `T`  | extends [`Schema`](README.md#schema) = [`Schema`](README.md#schema) |

#### Defined in

[types.ts:165](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L165)

---

### QueryFragments

Ƭ **QueryFragments**: [`QueryFragment`](README.md#queryfragment)[]

#### Defined in

[types.ts:181](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L181)

---

### Schema

Ƭ **Schema**: `Object`

Used to define the schema of a [Component](interfaces/Component.md).
Uses [Type](enums/Type.md) enum to be able to access the component type in JavaScript as well as have TypeScript type checks.

#### Index signature

▪ [key: `string`]: [`Type`](enums/Type.md)

#### Defined in

[types.ts:19](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L19)

---

### SchemaOf

Ƭ **SchemaOf**<`C`\>: `C` extends [`Component`](interfaces/Component.md)<infer S\> ? `S` : `never`

#### Type parameters

| Name | Type                                                                          |
| :--- | :---------------------------------------------------------------------------- |
| `C`  | extends [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema)\> |

#### Defined in

[types.ts:183](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L183)

---

### SettingQueryFragment

Ƭ **SettingQueryFragment**: [`ProxyReadQueryFragment`](README.md#proxyreadqueryfragment) \| [`ProxyExpandQueryFragment`](README.md#proxyexpandqueryfragment)

#### Defined in

[types.ts:179](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L179)

---

### ValueType

Ƭ **ValueType**<`T`\>: `Object`

Mapping between JavaScript [Type](enums/Type.md) enum and corresponding TypeScript type.

#### Type parameters

| Name | Type        |
| :--- | :---------- |
| `T`  | `undefined` |

#### Type declaration

| Name | Type                                              |
| :--- | :------------------------------------------------ |
| `0`  | `boolean`                                         |
| `1`  | `number`                                          |
| `10` | `bigint`[] \| `undefined`                         |
| `11` | `string`[]                                        |
| `12` | `string`[] \| `undefined`                         |
| `13` | [`EntityID`](README.md#entityid)                  |
| `14` | [`EntityID`](README.md#entityid) \| `undefined`   |
| `15` | [`EntityID`](README.md#entityid)[]                |
| `16` | [`EntityID`](README.md#entityid)[] \| `undefined` |
| `17` | `T`                                               |
| `18` | `T` \| `undefined`                                |
| `2`  | `number` \| `undefined`                           |
| `3`  | `bigint`                                          |
| `4`  | `bigint` \| `undefined`                           |
| `5`  | `string`                                          |
| `6`  | `string` \| `undefined`                           |
| `7`  | `number`[]                                        |
| `8`  | `number`[] \| `undefined`                         |
| `9`  | `bigint`[]                                        |

#### Defined in

[types.ts:36](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L36)

---

### World

Ƭ **World**: `Object`

Type of World returned by [createWorld](README.md#createworld).

#### Type declaration

| Name                   | Type                                                                                                                        |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `components`           | [`Component`](interfaces/Component.md)[]                                                                                    |
| `dispose`              | () => `void`                                                                                                                |
| `entities`             | [`EntityID`](README.md#entityid)[]                                                                                          |
| `entityToIndex`        | `Map`<[`EntityID`](README.md#entityid), [`EntityIndex`](README.md#entityindex)\>                                            |
| `getEntityIndexStrict` | (`entity`: [`EntityID`](README.md#entityid)) => [`EntityIndex`](README.md#entityindex)                                      |
| `hasEntity`            | (`entity`: [`EntityID`](README.md#entityid)) => `boolean`                                                                   |
| `registerComponent`    | (`component`: [`Component`](interfaces/Component.md)) => `void`                                                             |
| `registerDisposer`     | (`disposer`: () => `void`) => `void`                                                                                        |
| `registerEntity`       | (`options?`: { `id?`: [`EntityID`](README.md#entityid) ; `idSuffix?`: `string` }) => [`EntityIndex`](README.md#entityindex) |

#### Defined in

[types.ts:110](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L110)

## Variables

### OptionalTypes

• `Const` **OptionalTypes**: [`Type`](enums/Type.md)[]

Helper constant with all optional [Type](enums/Type.md)s.

#### Defined in

[constants.ts:44](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/constants.ts#L44)

## Functions

### Has

▸ **Has**<`T`\>(`component`): [`HasQueryFragment`](README.md#hasqueryfragment)

Create a [HasQueryFragment](README.md#hasqueryfragment).

**`Remarks`**

The [HasQueryFragment](README.md#hasqueryfragment) filters for entities that have the given component,
independent from the component value.

**`Example`**

Query for all entities with a `Position`.

```
runQuery([Has(Position)]);
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                              |
| :---------- | :------------------------------------------------------------------------------------------ | :--------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`, [`Metadata`](README.md#metadata), `undefined`\> | Component this query fragment refers to. |

#### Returns

[`HasQueryFragment`](README.md#hasqueryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:47](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L47)

---

### HasValue

▸ **HasValue**<`T`\>(`component`, `value`): [`HasValueQueryFragment`](README.md#hasvaluequeryfragment)

Create a [HasValueQueryFragment](README.md#hasvaluequeryfragment).

**`Remarks`**

The [HasValueQueryFragment](README.md#hasvaluequeryfragment) filters for entities that have the given component
with the given component value.

**`Example`**

Query for all entities at Position (0,0).

```
runQuery([HasValue(Position, { x: 0, y: 0 })]);
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                                                                |
| :---------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`, [`Metadata`](README.md#metadata), `undefined`\> | Component this query fragment refers to.                                   |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue)                                      | Only include entities with this (partial) component value from the result. |

#### Returns

[`HasValueQueryFragment`](README.md#hasvaluequeryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:88](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L88)

---

### Not

▸ **Not**<`T`\>(`component`): [`NotQueryFragment`](README.md#notqueryfragment)

Create a [NotQueryFragment](README.md#notqueryfragment).

**`Remarks`**

The [NotQueryFragment](README.md#notqueryfragment) filters for entities that don't have the given component,
independent from the component value.

**`Example`**

Query for all entities with a `Position` that are not `Movable`.

```
runQuery([Has(Position), Not(Movable)]);
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                              |
| :---------- | :------------------------------------------------------------------------------------------ | :--------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`, [`Metadata`](README.md#metadata), `undefined`\> | Component this query fragment refers to. |

#### Returns

[`NotQueryFragment`](README.md#notqueryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:67](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L67)

---

### NotValue

▸ **NotValue**<`T`\>(`component`, `value`): [`NotValueQueryFragment`](README.md#notvaluequeryfragment)

Create a [NotValueQueryFragment](README.md#notvaluequeryfragment).

**`Remarks`**

The [NotValueQueryFragment](README.md#notvaluequeryfragment) filters for entities that don't have the given component
with the given component value.

**`Example`**

Query for all entities that have a `Position`, except for those at `Position` (0,0).

```
runQuery([Has(Position), NotValue(Position, { x: 0, y: 0 })]);
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                                                           |
| :---------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`T`, [`Metadata`](README.md#metadata), `undefined`\> | Component this query fragment refers to.                              |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue)                                      | Exclude entities with this (partial) component value from the result. |

#### Returns

[`NotValueQueryFragment`](README.md#notvaluequeryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:112](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L112)

---

### ProxyExpand

▸ **ProxyExpand**(`component`, `depth`): [`ProxyExpandQueryFragment`](README.md#proxyexpandqueryfragment)

Create a [ProxyExpandQueryFragment](README.md#proxyexpandqueryfragment).

**`Remarks`**

The [ProxyExpandQueryFragment](README.md#proxyexpandqueryfragment) activates the "proxy expand mode" for the rest of the query.
This means that for all remaining fragments in the query not only the matching entities themselves are included in the intermediate set,
but also all their "children" down to the given `depth` on the relationship chain defined by the given `component`.

**`Example`**

Query for all entities (directly or indirectly) owned by an entity with `Name` "Alice".

```
runQuery([ProxyExpand(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })]);
```

#### Parameters

| Name        | Type                                                                                                                                  | Description                                      |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<{ `value`: [`Entity`](enums/Type.md#entity) }, [`Metadata`](README.md#metadata), `undefined`\> | Component to apply this query fragment to.       |
| `depth`     | `number`                                                                                                                              | Max depth in the relationship chain to traverse. |

#### Returns

[`ProxyExpandQueryFragment`](README.md#proxyexpandqueryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:159](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L159)

---

### ProxyRead

▸ **ProxyRead**(`component`, `depth`): [`ProxyReadQueryFragment`](README.md#proxyreadqueryfragment)

Create a [ProxyReadQueryFragment](README.md#proxyreadqueryfragment).

**`Remarks`**

The [ProxyReadQueryFragment](README.md#proxyreadqueryfragment) activates the "proxy read mode" for the rest of the query.
This means that for all remaining fragments in the query not only the entities themselves are checked, but also
their "ancestors" up to the given `depth` on the relationship chain defined by the given `component`.

**`Example`**

Query for all entities that have a `Position` and are (directly or indirectly) owned by an entity with `Name` "Alice".

```
runQuery([Has(Position), ProxyRead(OwnedByEntity, Number.MAX_SAFE_INTEGER), HasValue(Name, { name: "Alice" })]);
```

#### Parameters

| Name        | Type                                                                                                                                  | Description                                      |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<{ `value`: [`Entity`](enums/Type.md#entity) }, [`Metadata`](README.md#metadata), `undefined`\> | Component this query fragment refers to.         |
| `depth`     | `number`                                                                                                                              | Max depth in the relationship chain to traverse. |

#### Returns

[`ProxyReadQueryFragment`](README.md#proxyreadqueryfragment)

query fragment to be used in [runQuery](README.md#runquery) or [defineQuery](README.md#definequery).

#### Defined in

[Query.ts:137](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L137)

---

### clearLocalCache

▸ **clearLocalCache**(`component`, `uniqueWorldIdentifier?`): `void`

#### Parameters

| Name                     | Type                                                                                                                 |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------- |
| `component`              | [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\> |
| `uniqueWorldIdentifier?` | `string`                                                                                                             |

#### Returns

`void`

#### Defined in

[Component.ts:439](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L439)

---

### componentValueEquals

▸ **componentValueEquals**<`S`, `T`\>(`a?`, `b?`): `boolean`

Compare two [ComponentValue](README.md#componentvalue)s.
`a` can be a partial component value, in which case only the keys present in `a` are compared to the corresponding keys in `b`.

**`Example`**

```
componentValueEquals({ x: 1, y: 2 }, { x: 1, y: 3 }) // returns false because value of y doesn't match
componentValueEquals({ x: 1 }, { x: 1, y: 3 }) // returns true because x is equal and y is not present in a
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name | Type                                                   | Description                                                          |
| :--- | :----------------------------------------------------- | :------------------------------------------------------------------- |
| `a?` | `Partial`<[`ComponentValue`](README.md#componentvalue) | Partial [ComponentValue](README.md#componentvalue) to compare to `b` |
| `b?` | [`ComponentValue`](README.md#componentvalue)           | Component value to compare `a` to.                                   |

#### Returns

`boolean`

True if `a` equals `b` in the keys present in a or neither `a` nor `b` are defined, else false.

#### Defined in

[Component.ts:229](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L229)

---

### createEntity

▸ **createEntity**(`world`, `components?`, `options?`): [`EntityIndex`](README.md#entityindex)

Register a new entity in the given [World](README.md#world) and initialize it with the given [ComponentValue](README.md#componentvalue)s.

#### Parameters

| Name          | Type                                                                                                                                                                   | Description                                                                                                                                                                                                                                                                                                        |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world`       | [`World`](README.md#world)                                                                                                                                             | World object this entity should be registered in.                                                                                                                                                                                                                                                                  |
| `components?` | [[`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>, [`ComponentValue`](README.md#componentvalue)][] | Array of [[Component](README.md#definecomponent), [ComponentValue](README.md#componentvalue)] tuples to be added to this entity. (Use [withValue](README.md#withvalue) to generate these tuples with type safety.)                                                                                                 |
| `options?`    | { `id?`: [`EntityID`](README.md#entityid) } \| { `idSuffix?`: `string` }                                                                                               | Optional: { id: [EntityID](README.md#entityid) for this entity. Use this for entities that were created outside of recs, eg. in the corresponding solecs contracts. idSuffix: string to be appended to the auto-generated id. Use this for improved readability. Do not use this if the `id` option is provided. } |

#### Returns

[`EntityIndex`](README.md#entityindex)

index of this entity in the [World](README.md#world). This [EntityIndex](README.md#entityindex) is used to refer to this entity in other recs methods (eg [setComponent](README.md#setcomponent)).
(This is to avoid having to store strings in every component.)

#### Defined in

[Entity.ts:17](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Entity.ts#L17)

---

### createIndexer

▸ **createIndexer**<`S`, `M`, `T`\>(`component`): [`Indexer`](README.md#indexer)

Create an indexed component from a given component.

**`Remarks`**

An indexed component keeps a "reverse mapping" from [ComponentValue](README.md#componentvalue) to the Set of [Entities](README.md#createentity) with this value.
This adds a performance overhead to modifying component values and a memory overhead since in the worst case there is one Set per entity (if every entity has a different component value).
In return the performance for querying for entities with a given component value is close to O(1) (instead of O(#entities) in a regular non-indexed component).
As a rule of thumb only components that are added to many entities and are queried with [HasValue](README.md#hasvalue) a lot should be indexed (eg. the Position component).

**`Dev`**

This could be made more (memory) efficient by using a hash of the component value as key, but would require handling hash collisions.

#### Type parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)     |
| `M`  | extends [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                              |

#### Parameters

| Name        | Type                                                   | Description                                      |
| :---------- | :----------------------------------------------------- | :----------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> | [Component](README.md#definecomponent) to index. |

#### Returns

[`Indexer`](README.md#indexer)

Indexed version of the component.

#### Defined in

[Indexer.ts:18](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Indexer.ts#L18)

---

### createLocalCache

▸ **createLocalCache**<`S`, `M`, `T`\>(`component`, `uniqueWorldIdentifier?`): [`Component`](interfaces/Component.md)<`S`, `M`, `T`\>

#### Type parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)     |
| `M`  | extends [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                              |

#### Parameters

| Name                     | Type                                                   |
| :----------------------- | :----------------------------------------------------- |
| `component`              | [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> |
| `uniqueWorldIdentifier?` | `string`                                               |

#### Returns

[`Component`](interfaces/Component.md)<`S`, `M`, `T`\>

#### Defined in

[Component.ts:444](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L444)

---

### createWorld

▸ **createWorld**(): `Object`

Create a new World.

**`Remarks`**

A World is the central object of an ECS application, where all [Components](README.md#definecomponent),
registerEntity Entities and [Systems](README.md#definesystem) are registerd.

#### Returns

`Object`

A new World

| Name                   | Type                                                                                                                                          |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`           | [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>[]                        |
| `dispose`              | (`namespace?`: `string`) => `void`                                                                                                            |
| `entities`             | [`EntityID`](README.md#entityid)[]                                                                                                            |
| `entityToIndex`        | `Map`<[`EntityID`](README.md#entityid), [`EntityIndex`](README.md#entityindex)\>                                                              |
| `getEntityIndexStrict` | (`entity`: [`EntityID`](README.md#entityid)) => [`EntityIndex`](README.md#entityindex)                                                        |
| `hasEntity`            | (`entity`: [`EntityID`](README.md#entityid)) => `boolean`                                                                                     |
| `registerComponent`    | (`component`: [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>) => `void` |
| `registerDisposer`     | (`disposer`: () => `void`, `namespace`: `string`) => `void`                                                                                   |
| `registerEntity`       | (`__namedParameters`: { `id?`: [`EntityID`](README.md#entityid) ; `idSuffix?`: `string` }) => [`EntityIndex`](README.md#entityindex)          |

#### Defined in

[World.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/World.ts#L13)

---

### defineComponent

▸ **defineComponent**<`S`, `M`, `T`\>(`world`, `schema`, `options?`): [`Component`](interfaces/Component.md)<`S`, `M`, `T`\>

Components contain state indexed by entities and are one of the fundamental building blocks in ECS.
Besides containing the state, components expose an rxjs update$ stream, that emits an event any time the value
of an entity in this component is updated.

**`Remarks`**

Components work with [EntityIndex](README.md#entityindex), not [EntityID](README.md#entityid). Get the [EntityID](README.md#entityid) from a given [EntityIndex](README.md#entityindex) via [World](README.md#world).entities[EntityIndex].

**`Example`**

```
const Position = defineComponent(world, { x: Type.Number, y: Type.Number }, { id: "Position" });
```

#### Type parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)     |
| `M`  | extends [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                              |

#### Parameters

| Name                | Type                       | Description                                                                                                                                                                                                                                                                                   |
| :------------------ | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world`             | [`World`](README.md#world) | [World](README.md#world) object this component should be registered onto.                                                                                                                                                                                                                     |
| `schema`            | `S`                        | [Schema](README.md#schema) of component values. Uses Type enum as bridge between typescript types and javascript accessible values.                                                                                                                                                           |
| `options?`          | `Object`                   | Optional: { id: descriptive id for this component (otherwise an autogenerated id is used), metadata: arbitrary metadata (eg. contractId for solecs mapped components), indexed: if this flag is set, an indexer is applied to this component (see [createIndexer](README.md#createindexer)) } |
| `options.id?`       | `string`                   | -                                                                                                                                                                                                                                                                                             |
| `options.indexed?`  | `boolean`                  | -                                                                                                                                                                                                                                                                                             |
| `options.metadata?` | `M`                        | -                                                                                                                                                                                                                                                                                             |

#### Returns

[`Component`](interfaces/Component.md)<`S`, `M`, `T`\>

Component object linked to the provided World

#### Defined in

[Component.ts:42](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L42)

---

### defineComponentSystem

▸ **defineComponentSystem**<`S`\>(`world`, `component`, `system`, `options?`): `void`

Create a system that is called every time the given component is updated.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name                 | Type                                                                                        | Description                                                                                                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `world`              | [`World`](README.md#world)                                                                  | [World](README.md#world) object this system should be registered in.                                                                                                                |
| `component`          | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> | Component to whose updates to react.                                                                                                                                                |
| `system`             | (`update`: [`ComponentUpdate`](README.md#componentupdate) `void`                            | System function to run when the given component is updated.                                                                                                                         |
| `options`            | `Object`                                                                                    | Optional: { runOnInit: if true, run this system for all entities in the component when the system is created. Else only run on updates after the system is created. Default true. } |
| `options.runOnInit?` | `boolean`                                                                                   | -                                                                                                                                                                                   |

#### Returns

`void`

#### Defined in

[System.ts:115](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L115)

---

### defineEnterQuery

▸ **defineEnterQuery**(`fragments`, `options?`): `Observable`<[`ComponentUpdate`](README.md#componentupdate)\>

Define a query object that only passes update events of type [UpdateType](enums/UpdateType.md).Enter to the `update$` stream.
See [defineQuery](README.md#definequery) for details.

#### Parameters

| Name                 | Type                                         | Description     |
| :------------------- | :------------------------------------------- | :-------------- |
| `fragments`          | [`QueryFragment`](README.md#queryfragment)[] | Query fragments |
| `options?`           | `Object`                                     | -               |
| `options.runOnInit?` | `boolean`                                    | -               |

#### Returns

`Observable`<[`ComponentUpdate`](README.md#componentupdate)\>

Stream of component updates of entities matching the query for the first time

#### Defined in

[Query.ts:550](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L550)

---

### defineEnterSystem

▸ **defineEnterSystem**(`world`, `query`, `system`, `options?`): `void`

Create a system that is called on every event of the given [enter query](README.md#defineenterquery).

#### Parameters

| Name                 | Type                                                             | Description                                                                                                                                                                           |
| :------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `world`              | [`World`](README.md#world)                                       | [World](README.md#world) object this system should be registered in.                                                                                                                  |
| `query`              | [`QueryFragment`](README.md#queryfragment)[]                     | Enter query to react to.                                                                                                                                                              |
| `system`             | (`update`: [`ComponentUpdate`](README.md#componentupdate) `void` | System function to run when the result of the given enter query changes.                                                                                                              |
| `options`            | `Object`                                                         | Optional: { runOnInit: if true, run this system for all entities matching the query when the system is created. Else only run on updates after the system is created. Default true. } |
| `options.runOnInit?` | `boolean`                                                        | -                                                                                                                                                                                     |

#### Returns

`void`

#### Defined in

[System.ts:55](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L55)

---

### defineExitQuery

▸ **defineExitQuery**(`fragments`, `options?`): `Observable`<[`ComponentUpdate`](README.md#componentupdate)\>

Define a query object that only passes update events of type [UpdateType](enums/UpdateType.md).Exit to the `update$` stream.
See [defineQuery](README.md#definequery) for details.

#### Parameters

| Name                 | Type                                         | Description     |
| :------------------- | :------------------------------------------- | :-------------- |
| `fragments`          | [`QueryFragment`](README.md#queryfragment)[] | Query fragments |
| `options?`           | `Object`                                     | -               |
| `options.runOnInit?` | `boolean`                                    | -               |

#### Returns

`Observable`<[`ComponentUpdate`](README.md#componentupdate)\>

Stream of component updates of entities not matching the query anymore for the first time

#### Defined in

[Query.ts:564](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L564)

---

### defineExitSystem

▸ **defineExitSystem**(`world`, `query`, `system`, `options?`): `void`

Create a system that is called on every event of the given [exit query](README.md#defineexitquery).

#### Parameters

| Name                 | Type                                                             | Description                                                                                                                                                                           |
| :------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `world`              | [`World`](README.md#world)                                       | [World](README.md#world) object this system should be registered in.                                                                                                                  |
| `query`              | [`QueryFragment`](README.md#queryfragment)[]                     | Exit query to react to.                                                                                                                                                               |
| `system`             | (`update`: [`ComponentUpdate`](README.md#componentupdate) `void` | System function to run when the result of the given exit query changes.                                                                                                               |
| `options`            | `Object`                                                         | Optional: { runOnInit: if true, run this system for all entities matching the query when the system is created. Else only run on updates after the system is created. Default true. } |
| `options.runOnInit?` | `boolean`                                                        | -                                                                                                                                                                                     |

#### Returns

`void`

#### Defined in

[System.ts:75](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L75)

---

### defineQuery

▸ **defineQuery**(`fragments`, `options?`): `Object`

Create a query object including an update$ stream and a Set of entities currently matching the query.

**`Remarks`**

`update$` stream needs to be subscribed to in order for the logic inside the stream to be executed and therefore
in order for the `matching` set to be updated.

`defineQuery` should be strongly preferred over `runQuery` if the query is used for systems or other
use cases that repeatedly require the query result or updates to the query result. `defineQuery` does not
reevaluate the entire query if an accessed component changes, but only performs the minimal set of checks
on the updated entity to evaluate wether the entity still matches the query, resulting in significant performance
advantages over `runQuery`.

The query fragments are executed from left to right and are concatenated with a logical `AND`.
For performance reasons, the most restrictive query fragment should be first in the list of query fragments,
in order to reduce the number of entities the next query fragment needs to be checked for.
If no proxy fragments are used, every entity in the resulting set passes every query fragment.
If setting fragments are used, the order of the query fragments influences the result, since settings only apply to
fragments after the setting fragment.

#### Parameters

| Name                  | Type                                           | Description                                                                                                                                                                                                                                                                                              |
| :-------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fragments`           | [`QueryFragment`](README.md#queryfragment)[]   | Query fragments to execute.                                                                                                                                                                                                                                                                              |
| `options?`            | `Object`                                       | Optional: { runOnInit: if true, the query is executed once with `runQuery` to build an iniital Set of matching entities. If false only updates after the query was created are considered. initialSet: if given, this set is passed to `runOnInit` when building the initial Set of matching entities. } |
| `options.initialSet?` | `Set`<[`EntityIndex`](README.md#entityindex)\> | -                                                                                                                                                                                                                                                                                                        |
| `options.runOnInit?`  | `boolean`                                      | -                                                                                                                                                                                                                                                                                                        |

#### Returns

`Object`

Query object: {
update$: RxJS stream of updates to the query result. The update contains the component update that caused the query update, as well as the [update type](enums/UpdateType.md).
matching: Mobx observable set of entities currently matching the query.
}.

| Name       | Type                                                                                                            |
| :--------- | :-------------------------------------------------------------------------------------------------------------- |
| `matching` | `ObservableSet`<[`EntityIndex`](README.md#entityindex)\>                                                        |
| `update$`  | `Observable`<[`ComponentUpdate`](README.md#componentupdate) & { `type`: [`UpdateType`](enums/UpdateType.md) }\> |

#### Defined in

[Query.ts:418](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L418)

---

### defineRxSystem

▸ **defineRxSystem**<`T`\>(`world`, `observable$`, `system`): `void`

Create a system that is called on every update of the given observable.

**`Remarks`**

Advantage of using this function over directly subscribing to the RxJS observable is that the system is registered in the `world` and
disposed when the `world` is disposed (eg. during a hot reload in development).

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name          | Type                       | Description                                                                                                                   |
| :------------ | :------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `world`       | [`World`](README.md#world) | [World](README.md#world) object this system should be registered in.                                                          |
| `observable$` | `Observable`<`T`\>         | Observable to react to.                                                                                                       |
| `system`      | (`event`: `T`) => `void`   | System function to run on updates of the `observable$`. System function gets passed the update events from the `observable$`. |

#### Returns

`void`

#### Defined in

[System.ts:19](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L19)

---

### defineSyncSystem

▸ **defineSyncSystem**<`T`\>(`world`, `query`, `component`, `value`, `options?`): `void`

Create a system to synchronize updates to one component with another component.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name                 | Type                                                                                               | Description                                                                                  |
| :------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `world`              | [`World`](README.md#world)                                                                         | [World](README.md#world) object this system should be registered in.                         |
| `query`              | [`QueryFragment`](README.md#queryfragment)[]                                                       | Result of `component` is added to all entites matching this query.                           |
| `component`          | (`entity`: [`EntityIndex`](README.md#entityindex)) => [`Component`](interfaces/Component.md)       | Function returning the component to be added to all entities matching the given query.       |
| `value`              | (`entity`: [`EntityIndex`](README.md#entityindex)) => [`ComponentValue`](README.md#componentvalue) | Function returning the component value to be added to all entities matching the given query. |
| `options`            | `Object`                                                                                           | -                                                                                            |
| `options.runOnInit?` | `boolean`                                                                                          | -                                                                                            |
| `options.update?`    | `boolean`                                                                                          | -                                                                                            |

#### Returns

`void`

#### Defined in

[System.ts:133](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L133)

---

### defineSystem

▸ **defineSystem**(`world`, `query`, `system`, `options?`): `void`

Create a system that is called on every event of the given [query](README.md#definequery).

#### Parameters

| Name                 | Type                                                             | Description                                                                                                                                                                           |
| :------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `world`              | [`World`](README.md#world)                                       | [World](README.md#world) object this system should be registered in.                                                                                                                  |
| `query`              | [`QueryFragment`](README.md#queryfragment)[]                     | Query to react to.                                                                                                                                                                    |
| `system`             | (`update`: [`ComponentUpdate`](README.md#componentupdate) `void` | System function to run when the result of the given query changes.                                                                                                                    |
| `options`            | `Object`                                                         | Optional: { runOnInit: if true, run this system for all entities matching the query when the system is created. Else only run on updates after the system is created. Default true. } |
| `options.runOnInit?` | `boolean`                                                        | -                                                                                                                                                                                     |

#### Returns

`void`

#### Defined in

[System.ts:95](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L95)

---

### defineUpdateQuery

▸ **defineUpdateQuery**(`fragments`, `options?`): `Observable`<[`ComponentUpdate`](README.md#componentupdate) & { `type`: [`UpdateType`](enums/UpdateType.md) }\>

Define a query object that only passes update events of type [UpdateType](enums/UpdateType.md).Update to the `update$` stream.
See [defineQuery](README.md#definequery) for details.

#### Parameters

| Name                 | Type                                         | Description     |
| :------------------- | :------------------------------------------- | :-------------- |
| `fragments`          | [`QueryFragment`](README.md#queryfragment)[] | Query fragments |
| `options?`           | `Object`                                     | -               |
| `options.runOnInit?` | `boolean`                                    | -               |

#### Returns

`Observable`<[`ComponentUpdate`](README.md#componentupdate) & { `type`: [`UpdateType`](enums/UpdateType.md) }\>

Stream of component updates of entities that had already matched the query

#### Defined in

[Query.ts:536](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L536)

---

### defineUpdateSystem

▸ **defineUpdateSystem**(`world`, `query`, `system`, `options?`): `void`

Create a system that is called on every event of the given [update query](README.md#defineupdatequery).

#### Parameters

| Name                 | Type                                                             | Description                                                                                                                                                                           |
| :------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `world`              | [`World`](README.md#world)                                       | [World](README.md#world) object this system should be registered in.                                                                                                                  |
| `query`              | [`QueryFragment`](README.md#queryfragment)[]                     | Update query to react to.                                                                                                                                                             |
| `system`             | (`update`: [`ComponentUpdate`](README.md#componentupdate) `void` | System function to run when the result of the given update query changes.                                                                                                             |
| `options`            | `Object`                                                         | Optional: { runOnInit: if true, run this system for all entities matching the query when the system is created. Else only run on updates after the system is created. Default true. } |
| `options.runOnInit?` | `boolean`                                                        | -                                                                                                                                                                                     |

#### Returns

`void`

#### Defined in

[System.ts:35](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/System.ts#L35)

---

### getChildEntities

▸ **getChildEntities**(`entity`, `component`, `depth`): `Set`<[`EntityIndex`](README.md#entityindex)\>

Recursively compute all direct and indirect child entities up to the specified depth
down the relationship chain defined by the given component.

#### Parameters

| Name        | Type                                                                                                                                  | Description                                                    |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------- |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                                                                                | Entity to get all child entities for up to the specified depth |
| `component` | [`Component`](interfaces/Component.md)<{ `value`: [`Entity`](enums/Type.md#entity) }, [`Metadata`](README.md#metadata), `undefined`\> | Component to use for the relationship chain.                   |
| `depth`     | `number`                                                                                                                              | Depth up to which the recursion should be applied.             |

#### Returns

`Set`<[`EntityIndex`](README.md#entityindex)\>

Set of entities that are child entities of the given entity via the given component.

#### Defined in

[Query.ts:288](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L288)

---

### getComponentEntities

▸ **getComponentEntities**<`S`, `T`\>(`component`): `IterableIterator`<[`EntityIndex`](README.md#entityindex)\>

Get a set of all entities of the given component.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                     |
| :---------- | :---------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to get all entities from |

#### Returns

`IterableIterator`<[`EntityIndex`](README.md#entityindex)\>

Set of all entities in the given component.

#### Defined in

[Component.ts:292](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L292)

---

### getComponentValue

▸ **getComponentValue**<`S`, `T`\>(`component`, `entity`): [`ComponentValue`](README.md#componentvalue) \| `undefined`

Get the value of a given entity in the given component.
Returns undefined if no value or only a partial value is found.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                                                       |
| :---------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to get the value from for the given entity.                |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                              | [EntityIndex](README.md#entityindex) of the entity to get the value for from the given component. |

#### Returns

[`ComponentValue`](README.md#componentvalue) \| `undefined`

Value of the given entity in the given component or undefined if no value exists.

#### Defined in

[Component.ts:178](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L178)

---

### getComponentValueStrict

▸ **getComponentValueStrict**<`S`, `T`\>(`component`, `entity`): [`ComponentValue`](README.md#componentvalue)

Get the value of a given entity in the given component.
Throws an error if no value exists for the given entity in the given component.

**`Remarks`**

Throws an error if no value exists in the component for the given entity.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                                                       |
| :---------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to get the value from for the given entity.                |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                              | [EntityIndex](README.md#entityindex) of the entity to get the value for from the given component. |

#### Returns

[`ComponentValue`](README.md#componentvalue)

Value of the given entity in the given component.

#### Defined in

[Component.ts:206](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L206)

---

### getEntitiesWithValue

▸ **getEntitiesWithValue**<`S`\>(`component`, `value`): `Set`<[`EntityIndex`](README.md#entityindex)\>

Get a set of entities that have the given component value in the given component.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                                                          | Description                                                                       |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> \| [`Indexer`](README.md#indexer) | [Component](README.md#definecomponent) to get entities with the given value from. |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue)                                                                        | look for entities with this [ComponentValue](README.md#componentvalue).           |

#### Returns

`Set`<[`EntityIndex`](README.md#entityindex)\>

Set with [EntityIndices](README.md#entityindex) of the entities with the given component value.

#### Defined in

[Component.ts:266](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L266)

---

### getEntityComponents

▸ **getEntityComponents**(`world`, `entity`): [`Component`](interfaces/Component.md)[]

Get all components that have a value for the given entity.

**`Dev`**

Design decision: don't store a list of components for each entity but compute it dynamically when needed
because there are less components than entities and maintaining a list of components per entity is a large overhead.

#### Parameters

| Name     | Type                                   | Description                                                                           |
| :------- | :------------------------------------- | :------------------------------------------------------------------------------------ |
| `world`  | [`World`](README.md#world)             | World object the given entity is registered on.                                       |
| `entity` | [`EntityIndex`](README.md#entityindex) | [EntityIndex](README.md#entityindex) of the entity to get the list of components for. |

#### Returns

[`Component`](interfaces/Component.md)[]

Array of components that have a value for the given entity.

#### Defined in

[World.ts:96](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/World.ts#L96)

---

### hasComponent

▸ **hasComponent**<`S`, `T`\>(`component`, `entity`): `boolean`

Check whether a component contains a value for a given entity.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                                                                |
| :---------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to check whether it has a value for the given entity.               |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                              | [EntityIndex](README.md#entityindex) of the entity to check whether it has a value in the given component. |

#### Returns

`boolean`

true if the component contains a value for the given entity, else false.

#### Defined in

[Component.ts:162](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L162)

---

### isArrayType

▸ **isArrayType**(`t`): t is ArrayType

#### Parameters

| Name | Type                    |
| :--- | :---------------------- |
| `t`  | [`Type`](enums/Type.md) |

#### Returns

t is ArrayType

#### Defined in

[types.ts:235](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L235)

---

### isComponentUpdate

▸ **isComponentUpdate**<`S`\>(`update`, `component`): update is ComponentUpdate<S, undefined\>

Type guard to infer the TypeScript type of a given component update

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                                                                                 |
| :---------- | :------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------ |
| `update`    | [`ComponentUpdate`](README.md#componentupdate)                                              | Component update to infer the type of.                                                      |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> | [Component](README.md#definecomponent) to check whether the given update corresponds to it. |

#### Returns

update is ComponentUpdate<S, undefined\>

True (+ infered type for `update`) if `update` belongs to `component`. Else false.

#### Defined in

[utils.ts:13](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/utils.ts#L13)

---

### isEntityType

▸ **isEntityType**(`t`): t is EntityType

#### Parameters

| Name | Type                    |
| :--- | :---------------------- |
| `t`  | [`Type`](enums/Type.md) |

#### Returns

t is EntityType

#### Defined in

[types.ts:254](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L254)

---

### isFullComponentValue

▸ **isFullComponentValue**<`S`\>(`component`, `value`): value is ComponentValue<S, undefined\>

Helper function to check whether a given component value is partial or full.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        |
| :---------- | :------------------------------------------------------------------------------------------ |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> |
| `value`     | `Partial`<[`ComponentValue`](README.md#componentvalue)                                      |

#### Returns

value is ComponentValue<S, undefined\>

#### Defined in

[utils.ts:63](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/utils.ts#L63)

---

### isIndexer

▸ **isIndexer**<`S`\>(`c`): c is Indexer<S, Metadata, undefined\>

Helper function to check whether a given component is indexed.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name | Type                                                                                                                          |
| :--- | :---------------------------------------------------------------------------------------------------------------------------- |
| `c`  | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> \| [`Indexer`](README.md#indexer) |

#### Returns

c is Indexer<S, Metadata, undefined\>

#### Defined in

[utils.ts:53](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/utils.ts#L53)

---

### isNumberType

▸ **isNumberType**(`t`): t is NumberType

#### Parameters

| Name | Type                    |
| :--- | :---------------------- |
| `t`  | [`Type`](enums/Type.md) |

#### Returns

t is NumberType

#### Defined in

[types.ts:249](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L249)

---

### isOptionalType

▸ **isOptionalType**(`t`): t is OptionalType

#### Parameters

| Name | Type                    |
| :--- | :---------------------- |
| `t`  | [`Type`](enums/Type.md) |

#### Returns

t is OptionalType

#### Defined in

[types.ts:212](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/types.ts#L212)

---

### namespaceWorld

▸ **namespaceWorld**(`world`, `namespace`): `Object`

Create a new namespace from an existing World.
The `dispose` method of a namespaced World only calls disposers registered on this namespace.

#### Parameters

| Name                         | Type                                                                                                                                          | Description                             |
| :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| `world`                      | `Object`                                                                                                                                      | World to create a new namespace for.    |
| `world.components`           | [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>[]                        | -                                       |
| `world.dispose`              | (`namespace?`: `string`) => `void`                                                                                                            | -                                       |
| `world.entities`             | [`EntityID`](README.md#entityid)[]                                                                                                            | -                                       |
| `world.entityToIndex`        | `Map`<[`EntityID`](README.md#entityid), [`EntityIndex`](README.md#entityindex)\>                                                              | -                                       |
| `world.getEntityIndexStrict` | (`entity`: [`EntityID`](README.md#entityid)) => [`EntityIndex`](README.md#entityindex)                                                        | -                                       |
| `world.hasEntity`            | (`entity`: [`EntityID`](README.md#entityid)) => `boolean`                                                                                     | -                                       |
| `world.registerComponent`    | (`component`: [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>) => `void` | -                                       |
| `world.registerDisposer`     | (`disposer`: () => `void`, `namespace`: `string`) => `void`                                                                                   | -                                       |
| `world.registerEntity`       | (`__namedParameters`: { `id?`: [`EntityID`](README.md#entityid) ; `idSuffix?`: `string` }) => [`EntityIndex`](README.md#entityindex)          | -                                       |
| `namespace`                  | `string`                                                                                                                                      | String descriptor of the new namespace. |

#### Returns

`Object`

World with a new namespace.

| Name                   | Type                                                                                                                                          |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `components`           | [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>[]                        |
| `dispose`              | () => `void`                                                                                                                                  |
| `entities`             | [`EntityID`](README.md#entityid)[]                                                                                                            |
| `entityToIndex`        | `Map`<[`EntityID`](README.md#entityid), [`EntityIndex`](README.md#entityindex)\>                                                              |
| `getEntityIndexStrict` | (`entity`: [`EntityID`](README.md#entityid)) => [`EntityIndex`](README.md#entityindex)                                                        |
| `hasEntity`            | (`entity`: [`EntityID`](README.md#entityid)) => `boolean`                                                                                     |
| `registerComponent`    | (`component`: [`Component`](interfaces/Component.md)<[`Schema`](README.md#schema), [`Metadata`](README.md#metadata), `undefined`\>) => `void` |
| `registerDisposer`     | (`disposer`: () => `void`) => `void`                                                                                                          |
| `registerEntity`       | (`__namedParameters`: { `id?`: [`EntityID`](README.md#entityid) ; `idSuffix?`: `string` }) => [`EntityIndex`](README.md#entityindex)          |

#### Defined in

[World.ts:78](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/World.ts#L78)

---

### overridableComponent

▸ **overridableComponent**<`S`, `M`, `T`\>(`component`): [`OverridableComponent`](README.md#overridablecomponent)

An overridable component is a mirror of the source component, with functions to lazily override specific entity values.
Lazily override means the values are not actually set to the source component, but the override is only returned if the value is read.

- When an override for an entity is added to the component, the override is propagated via the component's `update$` stream.
- While an override is set for a specific entity, no updates to the source component for this entity will be propagated to the `update$` stream.
- When an override is removed for a specific entity and there are more overrides targeting this entity,
  the override with the highest nonce will be propagated to the `update$` stream.
- When an override is removed for a specific entity and there are no more overrides targeting this entity,
  the non-overridden underlying component value of this entity will be propagated to the `update$` stream.

#### Type parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)     |
| `M`  | extends [`Metadata`](README.md#metadata) |
| `T`  | `undefined`                              |

#### Parameters

| Name        | Type                                                   | Description                                                                                      |
| :---------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> | [Component](README.md#definecomponent) to use as underlying source for the overridable component |

#### Returns

[`OverridableComponent`](README.md#overridablecomponent)

overridable component

#### Defined in

[Component.ts:312](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L312)

---

### removeComponent

▸ **removeComponent**<`S`, `M`, `T`\>(`component`, `entity`): `void`

Remove a given entity from a given component.

#### Type parameters

| Name | Type                                     |
| :--- | :--------------------------------------- |
| `S`  | extends [`Schema`](README.md#schema)     |
| `M`  | extends [`Metadata`](README.md#metadata) |
| `T`  | `T`                                      |

#### Parameters

| Name        | Type                                                   | Description                                                                                           |
| :---------- | :----------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, `M`, `T`\> | [Component](README.md#definecomponent) to be updated.                                                 |
| `entity`    | [`EntityIndex`](README.md#entityindex)                 | [EntityIndex](README.md#entityindex) of the entity whose value should be removed from this component. |

#### Returns

`void`

#### Defined in

[Component.ts:144](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L144)

---

### runQuery

▸ **runQuery**(`fragments`, `initialSet?`): `Set`<[`EntityIndex`](README.md#entityindex)\>

Execute a list of query fragments to receive a Set of matching entities.

**`Remarks`**

The query fragments are executed from left to right and are concatenated with a logical `AND`.
For performance reasons, the most restrictive query fragment should be first in the list of query fragments,
in order to reduce the number of entities the next query fragment needs to be checked for.
If no proxy fragments are used, every entity in the resulting set passes every query fragment.
If setting fragments are used, the order of the query fragments influences the result, since settings only apply to
fragments after the setting fragment.

#### Parameters

| Name          | Type                                           | Description                                                                                                                  |
| :------------ | :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `fragments`   | [`QueryFragment`](README.md#queryfragment)[]   | Query fragments to execute.                                                                                                  |
| `initialSet?` | `Set`<[`EntityIndex`](README.md#entityindex)\> | Optional: provide a Set of entities to execute the query on. If none is given, all existing entities are used for the query. |

#### Returns

`Set`<[`EntityIndex`](README.md#entityindex)\>

Set of entities matching the query fragments.

#### Defined in

[Query.ts:321](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Query.ts#L321)

---

### setComponent

▸ **setComponent**<`S`, `T`\>(`component`, `entity`, `value`): `void`

Set the value for a given entity in a given component.

**`Example`**

```
setComponent(Position, entity, { x: 1, y: 2 });
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                                                          |
| :---------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to be updated.                                                |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                              | [EntityIndex](README.md#entityindex) of the entity whose value in the given component should be set. |
| `value`     | [`ComponentValue`](README.md#componentvalue)                                        | Value to set, schema must match the component schema.                                                |

#### Returns

`void`

#### Defined in

[Component.ts:71](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L71)

---

### toUpdate

▸ **toUpdate**<`S`\>(`entity`, `component`): [`ComponentUpdate`](README.md#componentupdate) & { `type`: [`UpdateType`](enums/UpdateType.md) }

Helper function to create a component update for the current component value of a given entity.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                                   |
| :---------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------- |
| `entity`    | [`EntityIndex`](README.md#entityindex)                                                      | Entity to create the component update for.    |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> | Component to create the component update for. |

#### Returns

[`ComponentUpdate`](README.md#componentupdate) & { `type`: [`UpdateType`](enums/UpdateType.md) }

Component update corresponding to the given entity, the given component and the entity's current component value.

#### Defined in

[utils.ts:27](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/utils.ts#L27)

---

### toUpdateStream

▸ **toUpdateStream**<`S`\>(`component`): `UnaryFunction`<`Observable`<[`EntityIndex`](README.md#entityindex)\>, `Observable`<[`ComponentUpdate`](README.md#componentupdate)

Helper function to turn a stream of [EntityIndices](README.md#entityindex) into a stream of component updates of the given component.

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |

#### Parameters

| Name        | Type                                                                                        | Description                            |
| :---------- | :------------------------------------------------------------------------------------------ | :------------------------------------- |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `undefined`\> | Component to create update stream for. |

#### Returns

`UnaryFunction`<`Observable`<[`EntityIndex`](README.md#entityindex)\>, `Observable`<[`ComponentUpdate`](README.md#componentupdate)

Unary function to be used with RxJS that turns stream of [EntityIndices](README.md#entityindex) into stream of component updates.

#### Defined in

[utils.ts:44](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/utils.ts#L44)

---

### updateComponent

▸ **updateComponent**<`S`, `T`\>(`component`, `entity`, `value`, `initialValue?`): `void`

Update the value for a given entity in a given component while keeping the old value of keys not included in the update.

**`Remarks`**

This function fails silently during runtime if a partial value is set for an entity that
does not have a component value yet, since then a partial value will be set in the component for this entity.

**`Example`**

```
updateComponent(Position, entity, { x: 1 });
```

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name            | Type                                                                                | Description                                                                                              |
| :-------------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `component`     | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) to be updated.                                                    |
| `entity`        | [`EntityIndex`](README.md#entityindex)                                              | [EntityIndex](README.md#entityindex) of the entity whose value in the given component should be updated. |
| `value`         | `Partial`<[`ComponentValue`](README.md#componentvalue)                              | Partial value to be set, remaining keys will be taken from the existing component value.                 |
| `initialValue?` | [`ComponentValue`](README.md#componentvalue)                                        | -                                                                                                        |

#### Returns

`void`

#### Defined in

[Component.ts:121](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L121)

---

### withValue

▸ **withValue**<`S`, `T`\>(`component`, `value`): [[`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\>, [`ComponentValue`](README.md#componentvalue)]

Util to create a tuple of a component and value with matching schema.
(Used to enforce Typescript type safety.)

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `S`  | extends [`Schema`](README.md#schema) |
| `T`  | `undefined`                          |

#### Parameters

| Name        | Type                                                                                | Description                                                         |
| :---------- | :---------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `component` | [`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\> | [Component](README.md#definecomponent) with ComponentSchema `S`     |
| `value`     | [`ComponentValue`](README.md#componentvalue)                                        | [ComponentValue](README.md#componentvalue) with ComponentSchema `S` |

#### Returns

[[`Component`](interfaces/Component.md)<`S`, [`Metadata`](README.md#metadata), `T`\>, [`ComponentValue`](README.md#componentvalue)]

Tuple `[component, value]`

#### Defined in

[Component.ts:252](https://github.com/latticexyz/mud/blob/edf9adc1e/packages/recs/src/Component.ts#L252)
