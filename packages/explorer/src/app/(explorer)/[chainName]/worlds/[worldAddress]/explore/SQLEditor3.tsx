"use client";

import { PlayIcon } from "lucide-react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useParams } from "next/navigation";
import { Parser } from "node-sql-parser";
import { useQueryState } from "nuqs";
import { Address } from "viem";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { cn } from "../../../../../../utils";
import { useChain } from "../../../../hooks/useChain";
import { constructTableName } from "../../../../utils/constructTableName";
import { useQueryAutocomplete } from "./useQueryAutocomplete";

const sqlParser = new Parser();

const options: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontWeight: "normal",
  wordWrap: "off",
  lineNumbers: "off",
  lineNumbersMinChars: 0,
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  lineDecorationsWidth: 0,
  glyphMargin: false,
  folding: false,
  scrollBeyondLastColumn: 0,
  scrollbar: {
    horizontal: "hidden",
    vertical: "hidden",
    alwaysConsumeMouseWheel: false,
    handleMouseWheel: false,
  },
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "never",
  },
  minimap: { enabled: false },
  wordBasedSuggestions: "off",
  links: false,
  occurrencesHighlight: "off",
  cursorStyle: "line-thin",
  renderLineHighlight: "none",
  contextmenu: false,
  roundedSelection: false,
  hover: {
    delay: 100,
  },
  acceptSuggestionOnEnter: "on",
  automaticLayout: true,
  fixedOverflowWidgets: true,
};

const monacoSuggestionsMap = {
  KEYWORD: "Keyword",
  TABLE: "Field",
  COLUMN: "Field",
} as const;

type Props = {
  table?: Table;
};

export function SQLEditor3({ table }: Props) {
  const monaco = useMonaco();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });
  const queryAutocomplete = useQueryAutocomplete(table);

  const form = useForm({
    defaultValues: {
      query: query || "",
    },
  });

  const setErrorMarker = useCallback(
    (message: string, startColumn: number, endColumn: number) => {
      if (!monaco) return;

      monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", [
        {
          severity: monaco.MarkerSeverity.Error,
          message,
          startLineNumber: 1,
          startColumn,
          endLineNumber: 1,
          endColumn,
        },
      ]);
    },
    [monaco],
  );

  const validateQuery = useCallback(
    (value: string) => {
      if (!monaco || !table) return true;

      try {
        const ast = sqlParser.astify(value);
        if ("columns" in ast && Array.isArray(ast.columns)) {
          for (const column of ast.columns) {
            const columnName = column.expr.column;
            if (!Object.keys(table.schema).includes(columnName)) {
              setErrorMarker(
                `Column '${columnName}' does not exist in the table schema.`,
                value.indexOf(columnName) + 1,
                value.indexOf(columnName) + columnName.length + 1,
              );
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
                setErrorMarker(
                  `Only '${tableName}' is available for this query.`,
                  value.indexOf(selectedTableName) + 1,
                  value.indexOf(selectedTableName) + selectedTableName.length + 1,
                );
                return false;
              }
            }
          }
        }

        monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", []);
        return true;
      } catch (error) {
        if (error instanceof Error) {
          setErrorMarker(error.message, 1, value.length + 1);
        }
        return false;
      }
    },
    [monaco, table, worldAddress, chainId, setErrorMarker],
  );

  const handleSubmit = form.handleSubmit((data) => {
    if (validateQuery(data.query)) {
      setQuery(data.query);
    }
  });

  useEffect(() => {
    form.reset({ query: query || "" });
  }, [query, form]);

  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: [" ", ".", ","],

        provideCompletionItems: (model, position) => {
          if (!queryAutocomplete) {
            return { suggestions: [] };
          }

          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          };

          const suggestions = queryAutocomplete.autocomplete(textUntilPosition).map(({ value, optionType }) => {
            return {
              label: value,
              kind: monaco.languages.CompletionItemKind[monacoSuggestionsMap[optionType]],
              insertText: value,
              range,
              // bring non-keyword suggestions to the top
              sortText: optionType !== "KEYWORD" ? "0" : "1",
            };
          });

          return {
            suggestions,
          };
        },
      });

      return () => {
        provider.dispose();
      };
    }
  }, [monaco, queryAutocomplete, validateQuery]);

  return (
    <Form {...form}>
      <form
        className={cn(
          "relative flex w-full flex-grow items-center justify-center bg-black align-middle",
          "max-rounded-md h-10 border px-3 py-2",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        onSubmit={handleSubmit}
      >
        <FormField
          name="query"
          render={({ field }) => (
            <Editor
              width="100%"
              theme="hc-black"
              value={field.value}
              options={options}
              language="sql"
              onChange={(value) => field.onChange(value)}
              loading={null}
            />
          )}
        />

        <Button className="absolute right-1 top-1 h-8 px-4" type="submit">
          <PlayIcon className="mr-1.5 h-3 w-3" /> Run
        </Button>
      </form>
    </Form>
  );
}
