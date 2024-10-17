"use client";

import { PlayIcon } from "lucide-react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useParams } from "next/navigation";
import { Parser } from "node-sql-parser";
import { useQueryState } from "nuqs";
import { SQLAutocomplete, SQLDialect } from "sql-autocomplete";
import { Address } from "viem";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { cn } from "../../../../../../utils";
import { useChain } from "../../../../hooks/useChain";
import { constructTableName } from "../../../../utils/constructTableName";

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

const monacoOptionTypesMap = {
  KEYWORD: "Keyword",
  TABLE: "Field",
  COLUMN: "Field",
} as const;

const sqlParser = new Parser();

type Props = {
  table?: Table;
};

export function SQLEditor3({ table }: Props) {
  const monaco = useMonaco();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });

  const validateSQL = useCallback(
    (value: string) => {
      if (!monaco || !table) return true;

      try {
        const ast = sqlParser.astify(value);
        if ("columns" in ast && Array.isArray(ast.columns) && ast.columns?.length) {
          for (const columnInfo of ast.columns) {
            const columnName = columnInfo.expr.column;
            if (!Object.keys(table.schema).includes(columnName)) {
              monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", [
                {
                  severity: monaco.MarkerSeverity.Error,
                  message: `Column '${columnName}' does not exist in the table schema`,
                  startLineNumber: 1,
                  startColumn: value.indexOf(columnName) + 1,
                  endLineNumber: 1,
                  endColumn: value.indexOf(columnName) + columnName.length + 1,
                },
              ]);
              return false;
            }
          }
        }

        monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", []);
        return true;
      } catch (error) {
        if (error instanceof Error) {
          monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "sql", [
            {
              severity: monaco.MarkerSeverity.Error,
              message: error.message,
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: 1,
              endColumn: value.length + 1,
            },
          ]);
        }
        return false;
      }
    },
    [monaco, table],
  );

  const form = useForm({
    defaultValues: {
      query: query || "",
    },
  });

  const sqlAutocomplete = useMemo(() => {
    if (!table) return null;
    return new SQLAutocomplete(
      SQLDialect.MYSQL,
      [constructTableName(table, worldAddress as Address, chainId)],
      Object.keys(table.schema),
    );
  }, [table, worldAddress, chainId]);

  const handleSubmit = form.handleSubmit((data) => {
    if (validateSQL(data.query)) {
      setQuery(data.query);
    }
  });

  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: [" ", ".", ","],

        provideCompletionItems: (model, position) => {
          if (!sqlAutocomplete) {
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

          const suggestions = sqlAutocomplete.autocomplete(textUntilPosition).map(({ value, optionType }) => {
            return {
              label: value,
              kind: monaco.languages.CompletionItemKind[monacoOptionTypesMap[optionType]],
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
  }, [monaco, sqlAutocomplete, validateSQL]);

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
