import { PlayIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { Address } from "viem";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { useChain } from "../../../../hooks/useChain";
import { constructTableName } from "../../../../utils/constructTableName";

const SQL_KEYWORDS = ["SELECT", "FROM", "WHERE", "AND", "OR"];

type Props = {
  table: Table;
  tables: Table[];
};

export function SQLEditor2({ table, tables }: Props) {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const monaco = useMonaco();
  const [query, setQuery] = useQueryState("query");
  const form = useForm({
    defaultValues: {
      query: query || "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    setQuery(data.query);
  });

  useEffect(() => {
    form.reset({ query: query || "" });
  }, [query, form]);

  console.log(tables);
  const columns = Object.keys(table?.schema || {});
  const selectableTables = (tables || []).map((table) => {
    return constructTableName(table, worldAddress as Address, chainId);
  });

  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerCompletionItemProvider("sql", {
        triggerCharacters: [" ", ".", ","], // Trigger autocomplete on space and dot

        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const trimmedText = textUntilPosition.toUpperCase().trim();
          const textSplit = trimmedText.split(/\s+/);

          const lastSqlKeyword = SQL_KEYWORDS.reduce((last, keyword) => {
            const lastIndex = textSplit.lastIndexOf(keyword);
            return lastIndex > -1 && (last === null || lastIndex > textSplit.lastIndexOf(last)) ? keyword : last;
          }, null);

          console.log(textSplit, lastSqlKeyword);

          const word = model.getWordUntilPosition(position);

          const range = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          };

          const suggestionsByTypeData = {
            select: columns,
            from: selectableTables,
            where: columns,
          };

          const suggestionByType = suggestionsByTypeData[lastSqlKeyword?.toLowerCase()];
          const keywordSuggestions = SQL_KEYWORDS.map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            sortText: "b",
          }));

          if (suggestionByType) {
            const fieldSuggestions = Array.from(suggestionByType).map((name) => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: name,
              range: range,
              sortText: "a",
            }));

            return { suggestions: [...fieldSuggestions, ...keywordSuggestions] };
          } else {
            return { suggestions: [...keywordSuggestions] };
          }
        },
      });
      return () => {
        provider.dispose();
      };
    }
  }, [monaco, columns, selectableTables]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <FormField
            name="query"
            render={({ field }) => (
              <div className="border">
                <MonacoEditor
                  width="100%"
                  height="40px"
                  language="sql"
                  theme="hc-black"
                  value={field.value}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    readOnly: false,
                    lineNumbers: "off",
                    renderLineHighlight: "none",
                    scrollbar: {
                      vertical: "hidden",
                    },
                    hideCursorInOverviewRuler: true,
                  }}
                  onChange={field.onChange}
                  loading={null}
                />
              </div>

              // <FormItem>
              //   <FormControl>
              //     <Input {...field} className="pr-[90px]" />
              //   </FormControl>
              // </FormItem>
            )}
          />

          <Button className="absolute right-1 top-1 h-8 px-4" type="submit">
            <PlayIcon className="mr-1.5 h-3 w-3" /> Run
          </Button>
        </div>
      </form>
    </Form>
  );
}