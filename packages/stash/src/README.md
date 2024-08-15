# TODOs

- Set up performance benchmarks for setting records, reading records, running queries, updating records with subscribers
- Replace objects with Maps for performance ? (https://rehmat-sayany.medium.com/using-map-over-objects-in-javascript-a-performance-benchmark-ff2f351851ed)
  - could be useful for TableRecords, Keys
- maybe add option to include records in the query result?
- Maybe turn `entityKey` into a tagged string? So we could make it the return type of `encodeKey`,
  and allow us to use Symbol (to reduce memory overhead) or something else later without breaking change
- add more query fragments - ie GreaterThan, LessThan, Range, etc
- we might be able to enable different key shapes if we add something like a `keySelector`
- getKeySchema expects a full table as type, but only needs schema and key

Ideas

- Update streams:
  - if each query added a new subscriber to the main state, each state update would trigger _every_ subscriber
  - instead we could add a subscriber per table, which can be subscribed to again, so we only have to iterate through all tables once,
    and then through all subscribers per table (only those who care about updates to this table)
- Query fragments:
  - Instead of pre-defined query types (Has, HasValue, Not, NotValue), could we define fragments in a self-contained way, so
    it's easy to add a new type of query fragment without changing the core code?
  - The main complexity is the logic to initialize the initial set with the first query fragment,
    but it's probably not that critical - we could just run the first fragment on all entities of the first table,
    unless an initialSet is provided.
