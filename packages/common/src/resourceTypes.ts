export const resourceTypes = ["table", "offchainTable", "namespace", "system"] as const;

export type ResourceType = (typeof resourceTypes)[number];
