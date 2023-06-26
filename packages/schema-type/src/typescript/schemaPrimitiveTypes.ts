import { schemaAbiTypeToDefaultValue } from "./schemaAbiTypeToDefaultValue";
import { SchemaAbiType } from "./schemaAbiTypes";
import { LiteralToBroad } from "./utils";

export type SchemaPrimitiveType = LiteralToBroad<(typeof schemaAbiTypeToDefaultValue)[SchemaAbiType]>;
