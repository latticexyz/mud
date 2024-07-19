import { describe, it } from "vitest";
import { World, defineWorld } from "@latticexyz/world";
import { attest } from "@arktype/attest";
import { getAllTables } from "./getAllTables";
import { Tables } from "@latticexyz/config";

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
});
