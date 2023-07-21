import { RenderField, renderArguments } from "@latticexyz/common/codegen";

/**
 * Render the contents of a solidity function to tightly encode the given tuple.
 * This is equivalent to solidity's internal storage packing; or encodePacked if it didn't pad array elements.
 * Nested tuples aren't supported (MUD doesn't need them).
 */
export function abiEncodeTightlyPacked(fields: RenderField[]) {
  const dynamicFields = fields.filter(({ staticByteLength }) => staticByteLength === 0);
  const totalStaticByteLength = fields.reduce((acc, { staticByteLength }) => acc + staticByteLength, 0);
  if (dynamicFields.length === 0) {
    return `
      return abi.encodePacked(${renderArguments(fields.map(({ name }) => name))});
    `;
  }

  let result = `uint256 _resultLength = ${totalStaticByteLength};`;
  for (const field of dynamicFields) {
    result += `_resultLength += ${renderDynamicByteLength(field)};`;
  }
  result += `
    bytes memory _result = new bytes(_resultLength);
    uint256 _resultPointer = Memory.dataPointer(_result);
  `;
  for (const field of fields) {
    if (field.arrayElement) {
      result += `
        EncodeArray.encodeToLocation(${field.name}, _resultPointer);
        _resultPointer += ${renderDynamicByteLength(field)};
      `;
    } else if (field.isDynamic) {
      result += `
        Memory.copy(Memory.dataPointer(${field.name}), _resultPointer, ${renderDynamicByteLength(field)});
        _resultPointer += ${renderDynamicByteLength(field)};
      `;
    } else {
      result += `
        Memory.mstoreN(${field.name}, _resultPointer, ${field.staticByteLength});
        _resultPointer += ${field.staticByteLength};
      `;
    }
  }
  result += `
    return _result;
  `;

  return result;
}

function renderDynamicByteLength(field: RenderField) {
  if (field.arrayElement) {
    return `${field.name}.length * ${field.arrayElement.staticByteLength}`;
  } else if (field.isDynamic) {
    return `${field.name}.length`;
  } else {
    throw new Error(`Field "${field.name}" is not dynamic`);
  }
}
