import worldsJson from "contracts/worlds.json";

export const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

// TODO: consider generating this file and include world const ABIs
