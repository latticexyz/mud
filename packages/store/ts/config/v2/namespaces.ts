export type namespacedTableKeys<store> = "tables" extends keyof store
  ? keyof {
      [key in keyof store["tables"] as "namespace" extends keyof store
        ? store["namespace"] extends ""
          ? key
          : `${store["namespace"] & string}__${key & string}`
        : key]: void;
    }
  : never;
