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

function findErrorPosition(query: string, target: string) {
  const lines = query.split("\n");
  let startLineNumber = 1;
  let startColumn = 1;
  let currentPosition = 0;

  for (let i = 0; i < lines.length; i++) {
    if (currentPosition + lines[i].length >= query.indexOf(target)) {
      startLineNumber = i + 1;
      startColumn = query.indexOf(target) - currentPosition + 1;
      break;
    }
    currentPosition += lines[i].length + 1;
  }

  return {
    startLineNumber,
    endLineNumber: startLineNumber,
    startColumn,
    endColumn: startColumn + target.length,
  };
}

export function useQueryValidator(table?: Table) {
  const monaco = useMonaco();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const setErrorMarker = useMonacoErrorMarker();

  return useCallback(
    (query: string) => {
      if (!monaco || !table) return true;

      const decodedQuery = decodeURIComponent(query);
      try {
        const ast = sqlParser.astify(decodedQuery);
        if ("columns" in ast && Array.isArray(ast.columns)) {
          for (const column of ast.columns) {
            const columnName = column.expr.column;
            if (!Object.keys(table.schema).includes(columnName)) {
              setErrorMarker({
                message: `Column '${columnName}' does not exist in the table schema.`,
                ...findErrorPosition(decodedQuery, columnName),
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
                  ...findErrorPosition(decodedQuery, selectedTableName),
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
          const lines = decodedQuery.split("\n");
          setErrorMarker({
            message: error.message,
            startLineNumber: 1,
            endLineNumber: lines.length,
            startColumn: 1,
            endColumn: lines[lines.length - 1].length + 1,
          });
        }
        return false;
      }
    },
    [monaco, table, setErrorMarker, worldAddress, chainId],
  );
}
