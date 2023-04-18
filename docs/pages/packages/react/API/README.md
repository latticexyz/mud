# @latticexyz/react

## Functions

### useComponentValue

▸ **useComponentValue**<`S`\>(`component`, `entityIndex`, `defaultValue`): `ComponentValue`<`S`\>

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `S`  | extends `Schema` |

#### Parameters

| Name           | Type                                       |
| :------------- | :----------------------------------------- |
| `component`    | `Component`<`S`, `Metadata`, `undefined`\> |
| `entityIndex`  | `undefined` \| `EntityIndex`               |
| `defaultValue` | `ComponentValue`<`S`, `undefined`\>        |

#### Returns

`ComponentValue`<`S`\>

#### Defined in

[useComponentValue.ts:14](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useComponentValue.ts#L14)

▸ **useComponentValue**<`S`\>(`component`, `entityIndex`): `ComponentValue`<`S`\> \| `undefined`

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `S`  | extends `Schema` |

#### Parameters

| Name          | Type                                       |
| :------------ | :----------------------------------------- |
| `component`   | `Component`<`S`, `Metadata`, `undefined`\> |
| `entityIndex` | `undefined` \| `EntityIndex`               |

#### Returns

`ComponentValue`<`S`\> \| `undefined`

#### Defined in

[useComponentValue.ts:20](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useComponentValue.ts#L20)

---

### useDeprecatedComputedValue

▸ **useDeprecatedComputedValue**<`T`\>(`computedValue`): `T`

**`Deprecated`**

See https://github.com/latticexyz/mud/issues/339

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name            | Type                                           |
| :-------------- | :--------------------------------------------- |
| `computedValue` | `IComputedValue`<`T`\> & { `observe_`: `any` } |

#### Returns

`T`

#### Defined in

[useDeprecatedComputedValue.ts:5](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useDeprecatedComputedValue.ts#L5)

---

### useEntityQuery

▸ **useEntityQuery**(`fragments`, `options?`): `EntityIndex`[]

Returns all matching `EntityIndex`es for a given entity query,
and triggers a re-render as new query results come in.

#### Parameters

| Name                           | Type                         | Description                                                                                        |
| :----------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------- |
| `fragments`                    | `QueryFragment`<`Schema`\>[] | Query fragments to match against, executed from left to right.                                     |
| `options?`                     | `Object`                     | -                                                                                                  |
| `options.updateOnValueChange?` | `boolean`                    | False - re-renders only on entity array changes. True (default) - also on component value changes. |

#### Returns

`EntityIndex`[]

Set of entities matching the query fragments.

#### Defined in

[useEntityQuery.ts:18](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useEntityQuery.ts#L18)

---

### useObservableValue

▸ **useObservableValue**<`T`\>(`observable`, `defaultValue`): `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name           | Type               |
| :------------- | :----------------- |
| `observable`   | `Observable`<`T`\> |
| `defaultValue` | `T`                |

#### Returns

`T`

#### Defined in

[useObservableValue.ts:4](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useObservableValue.ts#L4)

▸ **useObservableValue**<`T`\>(`observable`): `T` \| `undefined`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name         | Type               |
| :----------- | :----------------- |
| `observable` | `Observable`<`T`\> |

#### Returns

`T` \| `undefined`

#### Defined in

[useObservableValue.ts:6](https://github.com/latticexyz/mud/blob/28a579f35/packages/react/src/useObservableValue.ts#L6)
