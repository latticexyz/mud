import { useParams } from "next/navigation";
import { Parser } from "node-sql-parser";
import { Address } from "viem";
import { useCallback } from "react";
import { Table } from "@latticexyz/config";
import { useMonaco } from "@monaco-editor/react";
import { useChain } from "../../../../hooks/useChain";
import { constructTableName } from "../../../../utils/constructTableName";
import { useMonacoErrorMarker } from "./useMonacoErrorMarker";

const sqlParser = new Parser();

export function useQueryValidator(table?: Table) {
  const monaco = useMonaco();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const setErrorMarker = useMonacoErrorMarker();

  return useCallback(
    (value: string) => {
      if (!monaco || !table) return true;

      try {
        const ast = sqlParser.astify(value);
        if ("columns" in ast && Array.isArray(ast.columns)) {
          for (const column of ast.columns) {
            const columnName = column.expr.column;
            if (!Object.keys(table.schema).includes(columnName)) {
              setErrorMarker({
                message: `Column '${columnName}' does not exist in the table schema.`,
                startColumn: value.indexOf(columnName) + 1,
                endColumn: value.indexOf(columnName) + columnName.length + 1,
              });
              return false;
            }
          }
        }

        if ("from" in ast && Array.isArray(ast.from)) {
          for (const tableInfo of ast.from) {
            if ("table" in tableInfo) {
              const selectedTableName = tableInfo.table;
              const tableName = constructTableName(table, worldAddress as Address, chainId);

              if (selectedTableName !== tableName) {
                setErrorMarker({
                  message: `Only '${tableName}' is available for this query.`,
                  startColumn: value.indexOf(selectedTableName) + 1,
                  endColumn: value.indexOf(selectedTableName) + selectedTableName.length + 1,
                });
                return false;
              }
            }
          }
        }

        monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", []);
        return true;
      } catch (error) {
        if (error instanceof Error) {
          setErrorMarker({
            message: error.message,
            startColumn: 1,
            endColumn: value.length + 1,
          });
        }
        return false;
      }
    },
    [monaco, table, setErrorMarker, worldAddress, chainId],
  );
}
