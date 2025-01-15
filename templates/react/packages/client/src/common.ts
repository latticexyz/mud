import mudConfig from "contracts/mud.config";

export const chainId = import.meta.env.CHAIN_ID;
export const worldAddress = import.meta.env.WORLD_ADDRESS;
export const startBlock = import.meta.env.START_BLOCK;

export const url = new URL(window.location.href);

export type Direction = (typeof mudConfig.enums.Direction)[number];
