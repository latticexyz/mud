import { createStash } from "@latticexyz/stash/internal";
import config from "contracts/mud.config";

export const stash = createStash(config);
