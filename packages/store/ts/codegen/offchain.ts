import { renderArguments, renderCommonData, renderWithStore } from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";

export function renderOffchainMethods(options: RenderTableOptions) {
  const { structName, storeArgument } = options;
  const { _tableId, _typedTableId, _keyArgs, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);

  let result = renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
      /** Emit StoreSetRecord without modifying storage and using individual values${_commentSuffix} */
      function emitSet(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        renderArguments(options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)),
      ])}) internal {
        bytes memory _data = encode(${renderArguments(options.fields.map(({ name }) => name))});

        ${_keyTupleDefinition}

        ${_store}.emitSetRecord(_tableId, _keyTuple, _data, getFieldLayout());
      }

      /** Emit StoreDeleteRecord without modifying storage${_commentSuffix} */
      function emitDelete(${renderArguments([_typedStore, _typedTableId, _typedKeyArgs])}) internal {
        ${_keyTupleDefinition}

        ${_store}.emitDeleteRecord(_tableId, _keyTuple);
      }
    `
  );

  if (structName !== undefined) {
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix, _untypedStore) => `
        /** Emit StoreSetRecord without modifying storage and using the data struct${_commentSuffix} */
        function emitSet(${renderArguments([
          _typedStore,
          _typedTableId,
          _typedKeyArgs,
          `${structName} memory _table`,
        ])}) internal {
          emitSetRecord(${renderArguments([
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
