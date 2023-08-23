# MUD React

React hooks (and more) for building MUD clients.

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
