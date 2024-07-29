import { show } from "@ark/util";
import { Store } from "@latticexyz/store";

type flattenedTableKeys<config extends Store> = config extends { readonly namespaces: infer namespaces }
  ? {
      [namespaceLabel in keyof namespaces]: namespaces[namespaceLabel] extends { readonly tables: infer tables }
        ? `${namespaceLabel & string}__${keyof tables & string}`
        : never;
    }[keyof namespaces]
  : never;

// TODO: figure out how TS handles overlapping table labels so we can make runtime match

export type configToTables<config extends Store> = {
  readonly [key in flattenedTableKeys<config> as key extends `${string}__${infer tableLabel}`
    ? tableLabel
    : never]: key extends `${infer namespaceLabel}__${infer tableLabel}`
    ? config["namespaces"][namespaceLabel]["tables"][tableLabel]
    : never;
};

export function configToTables<config extends Store>(config: config): show<configToTables<config>> {
  const tables = Object.values(config.namespaces).flatMap((namespace) => Object.values(namespace.tables));
  return Object.fromEntries(tables.map((table) => [table.label, table])) as never;
}
