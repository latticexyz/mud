import { resourceToHex } from "@latticexyz/common";
import { Config } from "@latticexyz/store/config/v2";

// TODO(alvrs): table resolver doesn't yet provide `tableId` so we'll use this helper to inject it for now

export function getTables<config extends Config>(config: config): config["tables"] {
  const tables = Object.fromEntries(
    Object.entries(config.tables).map(([tableName, table]) => [
      tableName,
      {
        ...table,
        tableId: resourceToHex({
          // hardcoded for now because table doesn't have a `type` yet
          // TODO: use table type if available before `tableId`
          type: "table",
          // use config's namespace because table doesn't have `namespace` yet
          // TODO: fix `config.namespace` being `string | undefined` - it should always be set in resolved output
          // TODO: replace wih `table.namespace`
          namespace: config.namespace ?? "",
          // TODO: replace with `table.name` if available before `tableId`
          name: tableName,
        }),
      },
    ]),
  );

  return tables;
}
