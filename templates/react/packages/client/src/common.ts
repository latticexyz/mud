import mudConfig from "contracts/mud.config";

export const chainId = parseInt(import.meta.env.VITE_CHAIN_ID) || 31337;
export const url = new URL(window.location.href);

export type Direction = (typeof mudConfig.enums.Direction)[number];
