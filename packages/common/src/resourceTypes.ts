export const resourceTypes = ["table", "offchainTable", "namespace", "module", "system"] as const;

export type ResourceType = (typeof resourceTypes)[number];
