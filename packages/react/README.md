# MUD React

React hooks (and more) for building MUD clients.

## Hooks for `store-cache`

### useRows

Returns an array of all rows matching the provided filter. Re-renders if the filter changes or if table entries matching the provided filter change.

```typescript
// get a list of all entries in the database
const allRows = useRows(storeCache);
// -> [ { namespace: "", table: "Position", key: { key: "0x01" }, value: { x: 1, y: 2 } }, ... ]

// get a list of all entries in the Position table
const allPositionRows = useRows(storeCache, { table: "Position" });

// get a list of all entries in the position table with key greater than `0x0A`
const filteredRows = useRows(storeCache, { table: "Position", key: { gt: { key: "0x0A" } } });
```

### useRow

Returns a single row with the provided key in the provided table. Re-renders if the filter changes or if the value of this row changes.

```typescript
// get the Position value of key `0x01`
const position = useRow(storeCache, { table: "Position", key: { key: "0x01" } });
// -> { namespace: "", table: "Position", key: { key: "0x01" }, value: { x: 1, y: 2 } }
```

## Hooks for `recs`

### useComponentValue

Returns the value of the component for the entity, and triggers a re-render as the component is added/removed/updated.

```typescript
const position = useComponentValue(Position, entity);
```

### useEntityQuery

Returns all matching `EntityIndex`es for a given entity query, and triggers a re-render as new query results come in.

```typescript
const entities = useEntityQuery([Has(Position)]);
const playersAtPosition = useEntityQuery([Has(Player), HasValue(Position, { x: 0, y: 0 })]);
```
