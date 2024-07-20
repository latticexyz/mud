import { describe, it } from "vitest";
import { World, defineWorld } from "@latticexyz/world";
import { attest } from "@arktype/attest";
import { getAllTables } from "./getAllTables";
import { Tables } from "@latticexyz/config";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";

describe("getAllTables", () => {
  it("type satisfies Tables", () => {
    attest<Tables, getAllTables<World, {}>>();
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
    attest<Tables, typeof tables>();
    attest<keyof typeof tables, "ExceedsResourceNameSizeLimit" | "Table2" | "StoreHooks" | "NamespaceOwner">();
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
