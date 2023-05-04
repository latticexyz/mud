import { defineStoreComponents } from "@latticexyz/recs";
import { world } from "./world";
import mudConfig from "../../../contracts/mud.config.mjs";

export const contractComponents = defineStoreComponents(world, mudConfig);

export const clientComponents = {};
