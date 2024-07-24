import { flatMorph, show } from "@arktype/util";
import { Tables } from "./output";

/**
 * @internal Only kept for backwards compatibility
 */
export type resolveNamespacedTables<tables, namespace> = {
  readonly [label in keyof tables as namespace extends ""
    ? label
    : `${namespace & string}__${label & string}`]: tables[label];
};

/**
 * @internal Only kept for backwards compatibility
 */
export function resolveNamespacedTables<tables, namespace>(
  tables: tables,
  namespace: namespace,
): show<resolveNamespacedTables<tables, namespace>> {
  return flatMorph(tables as Tables, (label, table) => [
    namespace === "" ? label : `${namespace}__${label}`,
    table,
  ]) as never;
}
