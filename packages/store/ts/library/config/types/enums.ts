import { StringForUnion } from "@latticexyz/common/type-utils";

export type EnumsConfig<EnumNames extends StringForUnion = StringForUnion> = never extends EnumNames
  ? {
      /**
       * Enum names mapped to lists of their member names
       *
       * (enums are inferred to be absent)
       */
      enums?: Record<EnumNames, readonly string[]>;
    }
  : StringForUnion extends EnumNames
  ? {
      /**
       * Enum names mapped to lists of their member names
       *
       * (enums aren't inferred - use `mudConfig` or `storeConfig` helper, and `as const` for variables)
       */
      enums?: Record<EnumNames, readonly string[]>;
    }
  : {
      /**
       * Enum names mapped to lists of their member names
       *
       * Enums defined here can be used as types in table schemas/keys
       */
      enums: Record<EnumNames, readonly string[]>;
    };

export type ExpandedEnumsConfig<C extends EnumsConfig> = {
  enums: { [key in keyof C["enums"]]: C["enums"][key] };
};
