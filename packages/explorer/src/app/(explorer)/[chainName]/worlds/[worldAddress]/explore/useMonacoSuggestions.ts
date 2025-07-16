import { useEffect } from "react";
import { Table } from "@latticexyz/config";
import { useMonaco } from "@monaco-editor/react";
import { SuggestedSQLKeyword, monacoSuggestionsMap, suggestedSQLKeywords } from "./consts";
import { useQueryAutocomplete } from "./useQueryAutocomplete";

const isSuggestedSQLKeyword = (keyword: string): keyword is SuggestedSQLKeyword => {
  return (suggestedSQLKeywords as readonly string[]).includes(keyword);
};

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

        const suggestions = Array.from(
          // autocomplete can return duplicates, so we need to deduplicate
          new Map(queryAutocomplete.autocomplete(textUntilPosition).map((item) => [item.value, item])).values(),
        )
          .filter(({ value, optionType }) => (optionType === "KEYWORD" ? isSuggestedSQLKeyword(value) : !!value))
          .map(({ value, optionType }) => ({
            label: value,
            kind: monaco.languages.CompletionItemKind[monacoSuggestionsMap[optionType]],
            insertText: optionType === "KEYWORD" ? value : `"${value}"`,
            range,
            sortText: optionType !== "KEYWORD" ? "0" : "1",
          }));

        return { suggestions };
      },
    });

    return () => provider.dispose();
  }, [monaco, queryAutocomplete]);
}
