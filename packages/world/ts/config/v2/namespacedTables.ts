import { Namespaces } from "@latticexyz/store/config/v2";
import { getPath } from "@latticexyz/store/config/v2";

export type namespacedTableKeys<namespaces> = {
  [label in keyof namespaces]: namespaces[label] extends { tables: infer tables }
    ? `${label & string}__${keyof tables & string}`
    : never;
}[keyof namespaces];

export type resolveNamespacedTables<namespaces> = {
  readonly [key in namespacedTableKeys<namespaces>]: key extends `${infer namespace}__${infer table}`
    ? getPath<namespaces, [namespace, "tables", table]>
    : never;
};

/**
 * @deprecated Only kept for backwards compatibility
 */
export function resolveNamespacedTables<namespaces extends Namespaces>(
  namespaces: namespaces,
): resolveNamespacedTables<namespaces> {
  return Object.fromEntries(
    Object.entries(namespaces).flatMap(([namespaceLabel, namespace]) =>
      Object.entries(namespace.tables).map(([tableLabel, table]) => [`${namespaceLabel}__${tableLabel}`, table]),
    ),
  ) as never;
}
