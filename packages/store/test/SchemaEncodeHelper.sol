// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";

/**
 * Overrides for encode function to simplify tests
 */
library SchemaEncodeHelper {
  function encode(SchemaType a) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](1);
    schema[0] = a;
    return SchemaLib.encode(schema);
  }

  function encode(SchemaType a, SchemaType b) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](2);
    schema[0] = a;
    schema[1] = b;
    return SchemaLib.encode(schema);
  }

  function encode(SchemaType a, SchemaType b, SchemaType c) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](3);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    return SchemaLib.encode(schema);
  }

  function encode(SchemaType a, SchemaType b, SchemaType c, SchemaType d) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](4);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    return SchemaLib.encode(schema);
  }

  function encode(SchemaType a, SchemaType b, SchemaType c, SchemaType d, SchemaType e) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](5);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    return SchemaLib.encode(schema);
  }

  function encode(
    SchemaType a,
    SchemaType b,
    SchemaType c,
    SchemaType d,
    SchemaType e,
    SchemaType f
  ) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](6);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    schema[5] = f;
    return SchemaLib.encode(schema);
  }
}
