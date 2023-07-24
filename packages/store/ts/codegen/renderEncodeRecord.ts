import {
  RenderDynamicField,
  RenderField,
  RenderStaticField,
  renderArguments,
  renderList,
  shiftLeftBits,
} from "@latticexyz/common/codegen";
import { getSchemaTypeInfo } from "./userType";
import { AbiTypeToSchemaType } from "@latticexyz/schema-type/deprecated";

export function renderEncodeRecord(
  fields: RenderField[],
  staticFields: RenderStaticField[],
  dynamicFields: RenderDynamicField[]
) {
  return `
    /** Tightly pack full data using this table's schema */
    function encode(${renderArguments(
      fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (bytes memory) {
      ${renderEncodedLengths(dynamicFields)}
      ${renderEncodeRecordBody(staticFields, dynamicFields)}
    }
  `;
}

const PACKED_COUNTER_INNER_TYPE = "bytes32";

function renderEncodedLengths(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length > 0) {
    return `
    uint40[] memory _counters = new uint40[](${dynamicFields.length});
    ${renderList(dynamicFields, ({ name, arrayElement }, index) => {
      if (arrayElement) {
        return `_counters[${index}] = uint40(${name}.length * ${arrayElement.staticByteLength});`;
      } else {
        return `_counters[${index}] = uint40(bytes(${name}).length);`;
      }
    })}
    ${PACKED_COUNTER_INNER_TYPE} _encodedLengths = PackedCounterLib.pack(_counters).unwrap();
    `;
  } else {
    return "";
  }
}

/**
 * Render the contents of a solidity function to tightly encode the Store record.
 * The result is equivalent to solidity's internal storage packing; or encodePacked if it didn't pad array elements.
 *
 * Some MUD-specific concessions (as opposed to a generic function like encodePacked):
 * - source data location is assumed to be memory
 * - _encodedLengths isn't a normal static field, but hardcoded and used for dynamic lengths
 * - no nested structs
 * - static fields always precede dynamic fields
 *
 * TODO replace this with `abi.encodeTightlyPacked` if it's added to solidity
 * https://github.com/ethereum/solidity/issues/8441
 */
function renderEncodeRecordBody(staticFields: RenderField[], dynamicFields: RenderField[]) {
  if (dynamicFields.length === 0) {
    return `
      return abi.encodePacked(${renderArguments(staticFields.map(({ name }) => name))});
    `;
  }
  // Encode PackedCounter as a static pseudo-field if dynamic fields are present
  staticFields.push(encodedLengthsAsField());

  const totalStaticByteLength = staticFields.reduce((acc, { staticByteLength }) => acc + staticByteLength, 0);

  // Compute total length first, to know how much memory to allocate
  let result = `
    uint256 _resultLength;
    unchecked {
      _resultLength = ${totalStaticByteLength}
        + ${dynamicFields.map((_, index) => `_counters[${index}]`).join(" + ")};
    }
  `;

  // Within the same assembly block allocate memory and mstore all static fields
  // to take advantage of the memory tail being unallocated
  // (otherwise we'd have to be careful about memory corruption)
  result += `
    bytes memory _result;
    uint256 _resultPointer;

    /// @solidity memory-safe-assembly
    assembly {
      // allocate memory
      _result := mload(0x40)
      _resultPointer := add(_result, 0x20)
      mstore(0x40, add(_resultPointer, ${yulRoundUp("_resultLength")}))
      mstore(_result, _resultLength)
  `;
  if (staticFields.length > 0) {
    // Track the static field memory offset here to save some gas at runtime
    let staticFieldOffset = 0;
    for (const field of staticFields) {
      result += `
        mstore(add(_resultPointer, ${staticFieldOffset}), shl(${shiftLeftBits(field)}, ${field.name}))
      `;
      staticFieldOffset += field.staticByteLength;
    }
    result += `
      _resultPointer := add(_resultPointer, ${staticFieldOffset})
    `;
  }
  result += `
    }
  `;

  // Store all dynamic data
  // Ideally this would use yul functions to keep everything in 1 assembly block,
  // but yul functions can't be imported, and inlining would be bulky and make table libs unreadable
  for (const [index, field] of dynamicFields.entries()) {
    // Encode the field to the result pointer
    if (field.arrayElement) {
      result += `EncodeArray.encodeToLocation(${field.name}, _resultPointer);`;
    } else {
      result += `Memory.copy(Memory.dataPointer(bytes(${field.name})), _resultPointer, _counters[${index}]);`;
    }
    // Add field length to the result pointer, unless this was the last field
    if (index !== dynamicFields.length - 1) {
      result += `
        unchecked {
          _resultPointer += _counters[${index}];
        }
      `;
    }
  }
  result += `
    return _result;
  `;

  return result;
}

/**
 * Render yul ops that round up the variable to a multiple of 32
 * (solidity memory allocation should be word-aligned)
 */
function yulRoundUp(variableName: string) {
  return `and(add(${variableName}, 31), not(31))`;
}

function encodedLengthsAsField(): RenderField {
  const typeInfo = getSchemaTypeInfo(AbiTypeToSchemaType[PACKED_COUNTER_INNER_TYPE]);
  return {
    ...typeInfo,
    name: "_encodedLengths",
    methodNameSuffix: "",
    arrayElement: undefined,
  };
}
