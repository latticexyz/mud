import { flatMorph } from "@arktype/util";
import { Tables } from "./output";

export type resolveNamespacedTables<tables, namespace> = {
  readonly [label in keyof tables as namespace extends ""
    ? label
    : label | `${namespace & string}__${label & string}`]: label extends `${string}__${string}`
    ? {
        // Disable codegen and deploy for the backwards-compatible tables, since these are duplicate entries
        readonly [tableOption in keyof tables[label]]: "codegen" extends tableOption
          ? {
              readonly [codegenOption in keyof tables[label][tableOption]]: "disabled" extends codegenOption
                ? true
                : tables[label][tableOption][codegenOption];
            }
          : "deploy" extends tableOption
            ? {
                readonly [deployOption in keyof tables[label][tableOption]]: "disabled" extends deployOption
                  ? true
                  : tables[label][tableOption][deployOption];
              }
            : tables[label][tableOption];
      }
    : tables[label];
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
    ...(namespace !== ""
      ? flatMorph(tables as Tables, (label, table) => [
          `${namespace}__${label}`,
          {
            ...table,
            // Disable codegen and deploy for the backwards-compatible tables, since these are duplicate entries
            codegen: { ...table.codegen, disabled: true },
            deploy: { ...table.deploy, disabled: true },
          },
        ])
      : null),
  } as never;
}
