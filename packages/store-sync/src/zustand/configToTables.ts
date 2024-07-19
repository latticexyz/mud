import { satisfy, show } from "@arktype/util";
import { Tables } from "@latticexyz/config";
import { Store } from "@latticexyz/store";

type flattenedTableKeys<config extends Store> = config extends { readonly namespaces: infer namespaces }
  ? {
      [namespaceLabel in keyof namespaces]: namespaces[namespaceLabel] extends { readonly tables: infer tables }
        ? `${namespaceLabel & string}__${keyof tables & string}`
        : never;
    }[keyof namespaces]
  : never;

// TODO: figure out how TS handles overlapping table labels so we can make runtime match
// TODO: move satisfy to type test

export type configToTables<config extends Store> = satisfy<
  Tables,
  {
    readonly [key in flattenedTableKeys<config> as key extends `${string}__${infer tableLabel}`
      ? tableLabel
      : never]: key extends `${infer namespaceLabel}__${infer tableLabel}`
      ? config["namespaces"][namespaceLabel]["tables"][tableLabel]
      : never;
  }
>;

export function configToTables<config extends Store>(config: config): show<configToTables<config>> {
  const tables = Object.values(config.namespaces).flatMap((namespace) => Object.values(namespace.tables));
  return Object.fromEntries(tables.map((table) => [table.label, table])) as never;
}
