import { Tables } from "@latticexyz/config";

export type tablesByLabel<tables extends Tables> = {
  // TODO: switch from name to label once its available
  readonly [key in string & keyof tables as tables[key]["name"]]: tables[key];
};

export function tablesByLabel<tables extends Tables>(tables: tables): tablesByLabel<tables> {
  return Object.fromEntries(
    Object.entries(tables).map(([, table]) =>
      // TODO: switch from name to label once its available
      [table.name, table],
    ),
  ) as never;
}
