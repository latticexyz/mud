import { resolveConfig } from "@latticexyz/store";
import mudConfig from "contracts/mud.config";

export const tables = resolveConfig(mudConfig).tables;
