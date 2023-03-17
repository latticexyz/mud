import {
  renderCommonData,
  renderList,
  renderedSolidityHeader,
  renderImports,
  renderArguments,
  renderTableId,
} from "./common.js";
import { RenderPrototypeOptions } from "./types.js";

export function renderPrototype(options: RenderPrototypeOptions) {
  const { imports, libraryName, primaryKeys, tables } = options;

  const allTypedKeyArgs = renderArguments(
    primaryKeys.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
  );

  const tablesData = tables.map((table) => {
    const { _keyArgs } = renderCommonData({ staticResourceData: table.staticResourceData, primaryKeys });
    const common = {
      libraryName: table.libraryName,
      staticResourceData: table.staticResourceData,
      _keyArgs,
    };

    if (table.structName !== undefined) {
      // a struct can only be 1 argument
      const name = `_${table.libraryName}`;
      const typedName = `${table.structName} memory ${name}`;
      return {
        ...common,
        args: table.default === undefined ? [name] : [],
        typedArgs: table.default === undefined ? [typedName] : [],
        inputs: [
          {
            value: table.default ?? name,
          },
        ],
      };
    } else {
      // if table provides only 1 argument, use only the table name for it.
      // if table provides multiple arguments, prefix each one with its field name.
      const isPrefixed = table.fields.length > 1;
      const getName = ({ name }: { name: string }) => {
        return isPrefixed ? `_${name}_${table.libraryName}` : `_${table.libraryName}`;
      };
      const getTypedName = ({ typeWithLocation, name }: { typeWithLocation: string; name: string }) => {
        return `${typeWithLocation} ${getName({ name })}`;
      };

      const fieldsNoDefault = table.fields.filter((field) => field.default === undefined);
      return {
        ...common,
        args: fieldsNoDefault.map(getName),
        typedArgs: fieldsNoDefault.map(getTypedName),
        inputs: table.fields.map((field) => ({
          value: field.default ?? getName(field),
        })),
      };
    }
  });

  //const _valueArgs = renderArguments(valuesArgs.map(({name}) => name))
  const _typedTableDataArgs = renderArguments(tablesData.flatMap(({ typedArgs }) => typedArgs));

  return `${renderedSolidityHeader}

${
  imports.length > 0
    ? `
      ${renderImports(imports)}
    `
    : ""
}

library ${libraryName} {

  function create(${renderArguments([allTypedKeyArgs, _typedTableDataArgs])}) internal {
    ${renderList(
      tablesData,
      ({ libraryName, inputs, _keyArgs }) =>
        `${libraryName}.set(${renderArguments([_keyArgs, ...inputs.map(({ value }) => value)])});`
    )}
  }

  function destroy(${allTypedKeyArgs}) internal {
    ${renderList(tablesData, ({ libraryName, _keyArgs }) => `${libraryName}.deleteRecord(${_keyArgs});`)}
  }

  function getTableIds() internal pure returns (uint256[] memory _tableIds) {
    _tableIds = new uint256[](${tablesData.length});
    ${renderList(
      tablesData,
      ({ staticResourceData }, index) => `_tableIds[${index}] = ${renderTableId(staticResourceData).hardcodedTableId};`
    )}
  }
}

`;
}
