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

  const getFieldNameFactory = (libraryName: string) => {
    return {
      getName: ({ name }: { name: string }) => `_${name}_${libraryName}`,
      getTypedName: ({ typeWithLocation, name }: { typeWithLocation: string; name: string }) =>
        `${typeWithLocation} _${name}_${libraryName}`,
    };
  };

  const tablesData = tables.map((table) => {
    const { getName, getTypedName } = getFieldNameFactory(table.libraryName);
    const { _keyArgs } = renderCommonData({ staticResourceData: table.staticResourceData, primaryKeys });
    const common = {
      libraryName: table.libraryName,
      staticResourceData: table.staticResourceData,
      _keyArgs,
    };

    if (table.structName !== undefined) {
      const typeWithLocation = `${table.structName} memory`;
      const name = getName({ name: "data" });
      const typedName = getTypedName({ typeWithLocation, name: "data" });
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
      ({ libraryName, inputs, _keyArgs }) => `
      ${libraryName}.set(${renderArguments([_keyArgs, ...inputs.map(({ value }) => value)])});
    `
    )}
  }

  function destroy(${allTypedKeyArgs}) internal {
    ${renderList(
      tablesData,
      ({ libraryName, _keyArgs }) => `
      ${libraryName}.deleteRecord(${_keyArgs});
    `
    )}
  }

  function getTableIds() internal pure returns (uint256[] memory _tableIds) {
    _tableIds = new uint256[](${tablesData.length});
    ${renderList(
      tablesData,
      ({ staticResourceData }, index) => `
      _tableIds[${index}] = ${renderTableId(staticResourceData).hardcodedTableId};
    `
    )}
  }
}

`;
}
