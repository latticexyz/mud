export const resourceTypes = ["table", "offchainTable"] as const;

export type ResourceType = (typeof resourceTypes)[number];
