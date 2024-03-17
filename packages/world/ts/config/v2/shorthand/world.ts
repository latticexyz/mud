import {
  Enums,
  StoreConfigInputWithShorthands,
  UserTypes,
  extendedScope,
  isTableShorthandInput,
  mergeIfUndefined,
  resolveIfTableShorthand,
  resolveTableShorthand,
  validateTableShorthand,
  validateTableShorthandOrFull,
} from "@latticexyz/store/config/v2";
import { resolveWorldConfig, validateWorldConfig } from "../world";
import { WorldConfigInput } from "../input";
import { mapObject } from "@latticexyz/common/utils";

export type WorldConfigInputWithShorthands<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = Omit<
  WorldConfigInput<userTypes, enums>,
  "tables"
> &
  Pick<StoreConfigInputWithShorthands<userTypes, enums>, "tables">;

export type resolveWorldWithShorthands<input> = resolveWorldConfig<{
  [key in keyof input]: key extends "tables"
    ? {
        [tableKey in keyof input[key]]: mergeIfUndefined<
          resolveIfTableShorthand<input[key][tableKey], extendedScope<input>>,
          { name: tableKey }
        >;
      }
    : input[key];
}>;

export type validateWorldWithShorthands<input> = {
  [key in keyof input]: key extends "tables"
    ? {
        [tableKey in keyof input[key]]: validateTableShorthandOrFull<input[key][tableKey], extendedScope<input>>;
      }
    : validateWorldConfig<input>[key];
};

function validateWorldWithShorthands(input: unknown): asserts input is WorldConfigInputWithShorthands {
  //
}

export function resolveWorldWithShorthands<input>(
  input: validateWorldWithShorthands<input>,
): resolveWorldWithShorthands<input> {
  validateWorldWithShorthands(input);

  const scope = extendedScope(input);
  const tables = mapObject(input.tables, (table) => {
    return isTableShorthandInput(table, scope)
      ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
      : table;
  });
  const fullConfig = { ...input, tables };

  return resolveWorldConfig(
    fullConfig as validateWorldConfig<typeof fullConfig>,
  ) as unknown as resolveWorldWithShorthands<input>;
}
