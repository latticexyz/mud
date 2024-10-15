"use client";

import { PlayIcon } from "lucide-react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { SQLAutocomplete, SQLDialect } from "sql-autocomplete";
import { Address } from "viem";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
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

type Props = {
  table?: Table;
};

// this is not a controlled component
const EditorSmallInput = ({ table }: Props) => {
  const monaco = useMonaco();
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const [query, setQuery] = useQueryState("query", { defaultValue: "" });

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
    setQuery(data.query);
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
              sortText: optionType !== "KEYWORD" ? "a" : "b",
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
  }, [monaco, sqlAutocomplete]);

  return (
    <Form {...form}>
      <form
        className="relative flex h-10 max-h-10 w-full flex-grow items-center justify-center rounded-md border bg-black px-3 py-2 align-middle"
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
};

export { EditorSmallInput };
