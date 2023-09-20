export const resourceTypes = {
  table: "tb",
  offchainTable: "ot",
} as const;

export type ResourceType = (typeof resourceTypes)[keyof typeof resourceTypes];

export type ResourceId = {
  namespace: string;
  name: string;
  type: ResourceType;
};
