export type namespacedTableKeys<store> = "tables" extends keyof store
  ? "namespace" extends keyof store
    ? store["namespace"] extends string
      ? "" extends store["namespace"]
        ? keyof store["tables"]
        : `${store["namespace"] & string}__${keyof store["tables"] & string}`
      : keyof store["tables"]
    : keyof store["tables"]
  : never;
