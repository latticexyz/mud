import { renderArguments, renderCommonData, renderWithStore } from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";

export function renderEphemeralMethods(options: RenderTableOptions) {
  const { structName, storeArgument } = options;
  const { _tableId, _typedTableId, _keyArgs, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);

  let result = renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Emit the ephemeral event using individual values${_commentSuffix} */
    function setEphemeral(${renderArguments([
      _typedStore,
      _typedTableId,
      _typedKeyArgs,
      renderArguments(options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)),
    ])}) internal {
      bytes memory _data = encode(${renderArguments(options.fields.map(({ name }) => name))});

      ${_primaryKeysDefinition}

      ${_store}.setEphemeralRecord(_tableId, _primaryKeys, _data);
    }
  `
  );

  if (structName !== undefined) {
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix, _untypedStore) => `
      /** Emit the ephemeral event using the data struct${_commentSuffix} */
      function setEphemeral(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        `${structName} memory _table`,
      ])}) internal {
        setEphemeralRecord(${renderArguments([
          _untypedStore,
          _tableId,
          _keyArgs,
          renderArguments(options.fields.map(({ name }) => `_table.${name}`)),
        ])});
      }
    `
    );
  }

  return result;
}
