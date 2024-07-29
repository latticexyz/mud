import { show } from "@arktype/util";
import { Namespaces } from "./output";

type flattenNamespacedTableKeys<config> = config extends {
  readonly namespaces: infer namespaces;
}
  ? {
      [namespaceLabel in keyof namespaces]: namespaces[namespaceLabel] extends { readonly tables: infer tables }
        ? namespaceLabel extends ""
          ? keyof tables
          : `${namespaceLabel & string}__${keyof tables & string}`
        : never;
    }[keyof namespaces]
  : never;

/**
 * @internal Only kept for backwards compatibility
 */
export type flattenNamespacedTables<config> = config extends { readonly namespaces: Namespaces }
  ? {
      readonly [key in flattenNamespacedTableKeys<config>]: key extends `${infer namespaceLabel}__${infer tableLabel}`
        ? config["namespaces"][namespaceLabel]["tables"][tableLabel]
        : config["namespaces"][""]["tables"][key];
    }
  : never;

/**
 * @internal Only kept for backwards compatibility
 */
export function flattenNamespacedTables<config extends { readonly namespaces: Namespaces }>(
  config: config,
): show<flattenNamespacedTables<config>> {
  return Object.fromEntries(
    Object.entries(config.namespaces).flatMap(([namespaceLabel, namespace]) =>
      Object.entries(namespace.tables).map(([tableLabel, table]) => [
        namespaceLabel === "" ? tableLabel : `${namespaceLabel}__${tableLabel}`,
        table,
      ]),
    ),
  ) as never;
}
