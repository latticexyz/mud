import { RenderTableOptions } from "./types.js";

/**
 * Renders a list of lines
 */
export function renderList<T>(list: T[], renderItem: (item: T, index: number) => string) {
  return internalRenderList("", list, renderItem);
}

/**
 * Renders a comma-separated list of arguments for solidity functions, ignoring empty and undefined ones
 */
export function renderArguments(args: (string | undefined)[]) {
  const filteredArgs = args.filter((arg) => arg !== undefined && arg !== "") as string[];
  return internalRenderList(",", filteredArgs, (arg) => arg);
}

export function renderCommonData({ staticRouteData, primaryKeys }: RenderTableOptions) {
  // static route means static tableId as well, and no tableId arguments
  const _tableId = staticRouteData ? "" : "_tableId";
  const _typedTableId = staticRouteData ? "" : "uint256 _tableId";

  const _keyArgs = renderArguments(primaryKeys.map(({ name }) => name));
  const _typedKeyArgs = renderArguments(primaryKeys.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));

  const _primaryKeysDefinition = `
    bytes32[] memory _primaryKeys = new bytes32[](${primaryKeys.length});
    ${renderList(
      primaryKeys,
      ({ name, typeId, staticByteLength }, index) => `
    _primaryKeys[${index}] = ${renderValueTypeToBytes32(name, typeId, staticByteLength)};
    `
    )}
  `;

  return {
    _tableId,
    _typedTableId,
    _keyArgs,
    _typedKeyArgs,
    _primaryKeysDefinition,
  };
}

function renderValueTypeToBytes32(innerText: string, typeId: string, staticByteLength: number) {
  const bits = staticByteLength * 8;

  if (typeId.match(/^uint\d{1,3}$/)) {
    return `bytes32(uint256(${innerText}))`;
  } else if (typeId.match(/^int\d{1,3}$/)) {
    return `bytes32(uint256(uint${bits}(${innerText})))`;
  } else if (typeId.match(/^bytes\d{1,2}$/)) {
    return `bytes32(${innerText})`;
  } else if (typeId === "address") {
    return `bytes32(bytes20(${innerText}))`;
  } else if (typeId === "bool") {
    return `_boolToBytes32(${innerText})`;
  } else {
    throw new Error(`Unknown value type id ${typeId}`);
  }
}

function internalRenderList<T>(lineTerminator: string, list: T[], renderItem: (item: T, index: number) => string) {
  return list
    .map((item, index) => renderItem(item, index) + (index === list.length - 1 ? "" : lineTerminator))
    .join("\n");
}
