import { AnyPgColumnBuilder, boolean, text } from "drizzle-orm/pg-core";
import { SchemaAbiType } from "@latticexyz/schema-type";
import { assertExhaustive } from "@latticexyz/common/utils";
import { asAddress, asBigInt, asHex, asJson, asNumber } from "./columnTypes";

export function buildColumn(name: string, schemaAbiType: SchemaAbiType): AnyPgColumnBuilder {
  switch (schemaAbiType) {
    case "bool":
      return boolean(name);

    case "uint8":
    case "uint16":
    case "int8":
    case "int16":
      // smallint = 2 bytes (https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT)
      return asNumber(name, "smallint");

    case "uint24":
    case "uint32":
    case "int24":
    case "int32":
      // integer = 4 bytes (https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT)
      return asNumber(name, "integer");

    case "uint40":
    case "uint48":
    case "int40":
    case "int48":
      // bigint = 8 bytes (https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT)
      return asNumber(name, "bigint");

    case "uint56":
    case "uint64":
    case "int56":
    case "int64":
      // bigint = 8 bytes (https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-INT)
      return asBigInt(name, "bigint");

    case "uint72":
    case "uint80":
    case "uint88":
    case "uint96":
    case "uint104":
    case "uint112":
    case "uint120":
    case "uint128":
    case "uint136":
    case "uint144":
    case "uint152":
    case "uint160":
    case "uint168":
    case "uint176":
    case "uint184":
    case "uint192":
    case "uint200":
    case "uint208":
    case "uint216":
    case "uint224":
    case "uint232":
    case "uint240":
    case "uint248":
    case "uint256":
    case "int72":
    case "int80":
    case "int88":
    case "int96":
    case "int104":
    case "int112":
    case "int120":
    case "int128":
    case "int136":
    case "int144":
    case "int152":
    case "int160":
    case "int168":
    case "int176":
    case "int184":
    case "int192":
    case "int200":
    case "int208":
    case "int216":
    case "int224":
    case "int232":
    case "int240":
    case "int248":
    case "int256":
      // variable length (https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL)
      // we could refine this to the specific length for each type, but maybe not worth it
      return asBigInt(name, "numeric");

    case "bytes1":
    case "bytes2":
    case "bytes3":
    case "bytes4":
    case "bytes5":
    case "bytes6":
    case "bytes7":
    case "bytes8":
    case "bytes9":
    case "bytes10":
    case "bytes11":
    case "bytes12":
    case "bytes13":
    case "bytes14":
    case "bytes15":
    case "bytes16":
    case "bytes17":
    case "bytes18":
    case "bytes19":
    case "bytes20":
    case "bytes21":
    case "bytes22":
    case "bytes23":
    case "bytes24":
    case "bytes25":
    case "bytes26":
    case "bytes27":
    case "bytes28":
    case "bytes29":
    case "bytes30":
    case "bytes31":
    case "bytes32":
    case "bytes":
      return asHex(name);

    case "address":
      return asAddress(name);

    case "uint8[]":
    case "uint16[]":
    case "uint24[]":
    case "uint32[]":
    case "uint40[]":
    case "uint48[]":
    case "uint56[]":
    case "uint64[]":
    case "uint72[]":
    case "uint80[]":
    case "uint88[]":
    case "uint96[]":
    case "uint104[]":
    case "uint112[]":
    case "uint120[]":
    case "uint128[]":
    case "uint136[]":
    case "uint144[]":
    case "uint152[]":
    case "uint160[]":
    case "uint168[]":
    case "uint176[]":
    case "uint184[]":
    case "uint192[]":
    case "uint200[]":
    case "uint208[]":
    case "uint216[]":
    case "uint224[]":
    case "uint232[]":
    case "uint240[]":
    case "uint248[]":
    case "uint256[]":
    case "int8[]":
    case "int16[]":
    case "int24[]":
    case "int32[]":
    case "int40[]":
    case "int48[]":
    case "int56[]":
    case "int64[]":
    case "int72[]":
    case "int80[]":
    case "int88[]":
    case "int96[]":
    case "int104[]":
    case "int112[]":
    case "int120[]":
    case "int128[]":
    case "int136[]":
    case "int144[]":
    case "int152[]":
    case "int160[]":
    case "int168[]":
    case "int176[]":
    case "int184[]":
    case "int192[]":
    case "int200[]":
    case "int208[]":
    case "int216[]":
    case "int224[]":
    case "int232[]":
    case "int240[]":
    case "int248[]":
    case "int256[]":
    case "bytes1[]":
    case "bytes2[]":
    case "bytes3[]":
    case "bytes4[]":
    case "bytes5[]":
    case "bytes6[]":
    case "bytes7[]":
    case "bytes8[]":
    case "bytes9[]":
    case "bytes10[]":
    case "bytes11[]":
    case "bytes12[]":
    case "bytes13[]":
    case "bytes14[]":
    case "bytes15[]":
    case "bytes16[]":
    case "bytes17[]":
    case "bytes18[]":
    case "bytes19[]":
    case "bytes20[]":
    case "bytes21[]":
    case "bytes22[]":
    case "bytes23[]":
    case "bytes24[]":
    case "bytes25[]":
    case "bytes26[]":
    case "bytes27[]":
    case "bytes28[]":
    case "bytes29[]":
    case "bytes30[]":
    case "bytes31[]":
    case "bytes32[]":
    case "bool[]":
      return asJson(name);

    // TODO: normalize like address column type
    case "address[]":
      return asJson(name);

    case "string":
      return text(name);

    default:
      assertExhaustive(schemaAbiType, `Missing column type for schema ABI type ${schemaAbiType}`);
  }
}
