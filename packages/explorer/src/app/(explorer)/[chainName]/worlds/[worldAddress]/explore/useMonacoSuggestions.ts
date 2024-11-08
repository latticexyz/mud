import { useEffect } from "react";
import { Table } from "@latticexyz/config";
import { useMonaco } from "@monaco-editor/react";
import { useQueryAutocomplete } from "./useQueryAutocomplete";

const monacoSuggestionsMap = {
  KEYWORD: "Keyword",
  TABLE: "Field",
  COLUMN: "Field",
} as const;

export function useMonacoSuggestions(table?: Table) {
  const monaco = useMonaco();
  const queryAutocomplete = useQueryAutocomplete(table);

  useEffect(() => {
    if (!monaco) return;

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

        const suggestions = queryAutocomplete
          .autocomplete(textUntilPosition)
          .map(({ value, optionType }) => ({
            label: value,
            kind: monaco.languages.CompletionItemKind[monacoSuggestionsMap[optionType]],
            insertText: `"${value}"`,
            range,
            // move keyword optionType to the top of suggestions list
            sortText: optionType !== "KEYWORD" ? "0" : "1",
          }))
          .filter(({ label }) => !!label);

        return { suggestions };
      },
    });

    return () => provider.dispose();
  }, [monaco, queryAutocomplete]);
}
