# Store Cache

The Store Cache is a typed reactive database used to replicate the onchain Store of a MUD project into a Javacsript client (Node or Browser based).

It is based on [Tuple Database](https://github.com/ccorcos/tuple-database) -- a reactive schema-less typscript database.

## Features

1. **Reactive queries**: The Store Cache supports registering reactive queries and re-executing logic when changes happen.
2. **Magic typing from a MUD Config**: The Cache is automatically typed from your MUD config. No code-generation necessary.
3. **React-hooks**: This package includes React hooks to subscribe to a single value, or the result of a query.

## Setup

```typescript
const config = mudConfig({
  namespace: "somenamespace",
  tables: {
    Counter: { primaryKeys: { first: "bytes32", second: "uint256" }, schema: "uint256" },
    Position: { schema: { x: "int32", y: "int32" } },
    MultiKey: { primaryKeys: { first: "bytes32", second: "uint32" }, schema: "int32" },
  },
});
const db = createDatabase();
const client = createDatabaseClient(db, config);
// This is typed!
client.tables.Position.set({ key: "0x00" }, { x: 10, y: 12 });
// And this won't compile: key is not a bytes32, and x is not number
client.tables.Position.set({ key: "foo" }, { x: "genius", y: 12 });
```

When using Store with the networking stack of MUD, _you do not need to set value into the Store yourself_: the networking stack will synchronize the onchain store and the your client store transparently.
You can simply read values and subscribe to changes, the data will be kept up to date and your client will re-render when the onchain state is modified.

## API

### Fetch data from the Store

```typescript
client.tables.MultiKey.get({ first: "0x00F", second: 12 });
client.tables.Counter.get({ first: "0x00F", second: 23233n });
// when the name of the primary keys is not defined, the default is a single key called "key"
// config: Position: { schema: { x: "int32", y: "int32" } }
client.tables.Position.get({ key: "0x00DEADDEADEAD" });
```

### Subscribe to a simple key-based query

```typescript
// subscribe to all changes of the Position table
client.tables.Position.subscribe(({set, remove}) => {
  for(const entrySet of set) {
    // { key: "0x00" }, { x: 1, y: 2 }
    console.log(entrySet.key, entrySet.value);
  }
});
// subscribe to all changes of a single record with key 0x01
client.tables.Position.subscribe(({set, remove}, { key: { eq: { key: "0x01" } } }) => {
  for(const entrySet of set) {
    // { key: "0x01" }, { x: 1, y: 2 }
    console.log(entrySet.key, entrySet.value);
  }
});
```

### Subscribe to complex queries

TODO: @alvrs
