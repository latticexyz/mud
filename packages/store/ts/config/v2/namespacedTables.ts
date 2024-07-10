import { flatMorph } from "@arktype/util";
import { Tables } from "./output";

export type resolveNamespacedTables<tables, namespace> = {
  readonly [label in keyof tables as namespace extends ""
    ? label
    : label | `${namespace & string}__${label & string}`]: tables[label];
};

/**
 * @deprecated Only kept for backwards compatibility
 */
export function resolveNamespacedTables<tables, namespace>(
  tables: tables,
  namespace: namespace,
): resolveNamespacedTables<tables, namespace> {
  return {
    ...tables,
    ...(namespace !== "" ? flatMorph(tables as Tables, (label, table) => [`${namespace}__${label}`, table]) : null),
  } as never;
}
