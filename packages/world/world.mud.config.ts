import { defineWorld } from "./ts/config/v2/world";
import { configInput } from "./mud.config";

export default defineWorld({ ...configInput, namespace: "" });
