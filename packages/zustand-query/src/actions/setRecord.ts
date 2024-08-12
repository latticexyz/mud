import { Store as StoreConfig } from "@latticexyz/store/config/v2";
import { TableLabel, Key, TableRecord, Store, getTableConfig, getNamespaces } from "../common";
import { setRecords } from "./setRecords";

export type SetRecordArgs<
  config extends StoreConfig = StoreConfig,
  // TODO: should we require a full table config here? then we wouldn't have to look up and infer as much
  // and could just register a table if it wasn't seen before.
  // And users can still do `getTable()` to do it via only the namespace/label.
  // Also wouldn't need the `withDefaultNamespace` stuff then.
  tableLabel extends TableLabel<config, getNamespaces<config>> = TableLabel<config, getNamespaces<config>>,
> = {
  store: Store<config>;
  table: tableLabel;
  key: Key<getTableConfig<config, tableLabel["namespace"], tableLabel["label"]>>;
  record: Partial<TableRecord<getTableConfig<config, tableLabel["namespace"], tableLabel["label"]>>>;
};

export type SetRecordResult = void;

export function setRecord<
  config extends StoreConfig = StoreConfig,
  tableLabel extends TableLabel<config, getNamespaces<config>> = TableLabel<config, getNamespaces<config>>,
>({ store, table, key, record }: SetRecordArgs<config, tableLabel>): SetRecordResult {
  setRecords({
    store,
    table,
    records: [
      // Stored record should include key
      { ...record, ...key },
    ],
  });
}
