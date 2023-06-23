import { MergeReturnType } from "@latticexyz/common/type-utils";
import { ExpandConfig, expandConfig } from "@latticexyz/config";
import { mudConfig, storePlugin } from "@latticexyz/store";
import { expect, test } from "vitest";
import { worldPlugin } from "./plugin";
import { resolveWorldConfig } from "./resolveWorldConfig";

const config = mudConfig({
  plugins: { storePlugin: storePlugin, worldPlugin: worldPlugin },
  tables: {
    Selector: {
      schema: "uint256",
    },
  },
  systems: {
    Selector: {
      openAccess: false,
      accessList: [],
    },
  },
});

const _typedExpandConfig = expandConfig as ExpandConfig<typeof config>;
type ExpandedConfig = MergeReturnType<typeof _typedExpandConfig<typeof config>>;
const expandedConfig = expandConfig(config) as ExpandedConfig;

test("resolveWorldConfig requires unique table and system names", () => {
  expect(() => resolveWorldConfig(expandedConfig, ["Selector"])).toThrowError(
    "Table and system names must be unique: Selector"
  );
});
