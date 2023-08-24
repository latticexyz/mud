// When this is incremented, it forces all indexers to reindex from scratch the next time they start up.
// Only use this when the schemas change, until we get proper schema migrations.
// TODO: instead of this, detect schema changes and drop/recreate tables as needed
export const schemaVersion = 1;
