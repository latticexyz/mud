import { Tables } from "@latticexyz/config";

export type tablesByLabel<tables extends Tables> = {
  readonly [key in string & keyof tables as tables[key]["label"]]: tables[key];
};

export function tablesByLabel<tables extends Tables>(tables: tables): tablesByLabel<tables> {
  return Object.fromEntries(Object.entries(tables).map(([, table]) => [table.label, table])) as never;
}
