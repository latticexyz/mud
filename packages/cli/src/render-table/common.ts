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

export function renderCommonData({ staticRouteData, keyTuple }: RenderTableOptions) {
  // static route means static tableId as well, and no tableId arguments
  const _tableId = staticRouteData ? "" : "_tableId";
  const _typedTableId = staticRouteData ? "" : "uint256 _tableId";

  const _keyArgs = renderArguments(keyTuple);
  const _typedKeyArgs = renderArguments(keyTuple.map((key) => `bytes32 ${key}`));

  const _keyTupleDefinition = `
    bytes32[] memory _keyTuple = new bytes32[](${keyTuple.length});
    ${renderList(
      keyTuple,
      (key, index) => `
    _keyTuple[${index}] = ${key};
    `
    )}
  `;

  return {
    _tableId,
    _typedTableId,
    _keyArgs,
    _typedKeyArgs,
    _keyTupleDefinition,
  };
}

function internalRenderList<T>(lineTerminator: string, list: T[], renderItem: (item: T, index: number) => string) {
  return list
    .map((item, index) => renderItem(item, index) + (index === list.length - 1 ? "" : lineTerminator))
    .join("\n");
}
