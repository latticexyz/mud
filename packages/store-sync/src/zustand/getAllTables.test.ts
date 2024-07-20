import { describe, it } from "vitest";
import { World, defineWorld } from "@latticexyz/world";
import { attest } from "@arktype/attest";
import { getAllTables } from "./getAllTables";
import { Tables } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { satisfy } from "@arktype/util";

describe("getAllTables", () => {
  it("type satisfies Tables", () => {
    attest<getAllTables<World, {}>, satisfy<Tables, getAllTables<World, {}>>>();
  });

  it("returns combined tables", () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        ExceedsResourceNameSizeLimit: "bytes32",
        Table2: "address",
      },
    });
    const tables = getAllTables(config, {});
    attest<typeof tables, satisfy<Tables, typeof tables>>();

    type expectedKeys = "ExceedsResourceNameSizeLimit" | "Table2" | "StoreHooks" | "NamespaceOwner";
    attest<expectedKeys, keyof typeof tables & expectedKeys>();
  });

  it("prioritizes MUD tables over user defined ones", () => {
    const config = defineWorld({
      namespace: "app",
      tables: {
        StoreHooks: "bool",
        NamespaceOwner: "bool",
      },
    });
    const tables = getAllTables(config, {});
    attest(tables.StoreHooks).equals(storeConfig.namespaces.store.tables.StoreHooks);
    attest(tables.NamespaceOwner).equals(worldConfig.namespaces.world.tables.NamespaceOwner);
  });
});
