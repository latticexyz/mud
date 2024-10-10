import { Loader2Icon, LoaderIcon, PlayIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormControl, FormField, FormItem } from "../../../../../../components/ui/Form";
import { Input } from "../../../../../../components/ui/Input";

const SQL_KEYWORDS = ["SELECT", "WHERE", "AND", "OR", "FROM"];

function shouldTriggerAutocomplete(text: string): boolean {
  const trimmedText = text.trim();
  const textSplit = trimmedText.split(/\s+/);
  const lastSignificantWord = trimmedText.split(/\s+/).pop()?.toUpperCase();
  const triggerKeywords = ["SELECT", "WHERE", "AND", "OR", "FROM"];

  if (textSplit.length == 2 && textSplit[0].toUpperCase() == "WHERE") {
    /* since we pre-pend the 'WHERE', we want the autocomplete to show up for the first letter typed
     which would come through as 'WHERE a' if the user just typed the letter 'a'
     so the when we split that text, we check if the length is 2 (as a way of checking if the user has only typed one letter or is still on the first word) and if it is and the first word is 'WHERE' which it should be since we pre-pend it, then show the auto-complete */
    return true;
  } else {
    return (
      triggerKeywords.includes(lastSignificantWord || "") ||
      triggerKeywords.some((keyword) => trimmedText.endsWith(keyword + " "))
    );
  }
}

export function SQLEditor2() {
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

  const columns = ["abc", "def", "asd"];
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

          // Check if the last character or word should trigger the auto-complete
          // if (!shouldTriggerAutocomplete(textUntilPosition)) {
          //   return { suggestions: [] };
          // }

          const trimmedText = textUntilPosition.trim();
          const textSplit = trimmedText.split(/\s+/);
          const lastSignificantWord = trimmedText.split(/\s+/).pop()?.toUpperCase();

          const lastSqlKeyword = SQL_KEYWORDS.reduce(
            (last, keyword) => (textSplit.includes(keyword) ? keyword : last),
            null,
          );
          console.log(lastSignificantWord, lastSqlKeyword);

          const word = model.getWordUntilPosition(position);

          const range = {
            startLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: word.endColumn,
          };

          const suggestionsByTypeData = {
            select: ["col1", "col2", "col3"],
            from: ["from1", "from2", "from3"],
            where: ["where1", "where2", "where"],
          };

          const suggestionByType = suggestionsByTypeData[lastSignificantWord?.toLowerCase()];

          if (suggestionByType) {
            const suggestions = Array.from(suggestionByType).map((name) => ({
              label: name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: name,
              range: range,
            }));

            return { suggestions };
          } else {
            return { suggestions: [] };
          }
        },
      });
      return () => {
        provider.dispose();
      };
    }
  }, [monaco, columns]);

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
