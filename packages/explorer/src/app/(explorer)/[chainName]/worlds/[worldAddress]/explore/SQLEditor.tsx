"use client";

import { CommandIcon, CornerDownLeft, LoaderIcon, PauseIcon, PlayIcon } from "lucide-react";
import { KeyCode, KeyMod, editor } from "monaco-editor/esm/vs/editor/editor.api";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Table } from "@latticexyz/config";
import Editor from "@monaco-editor/react";
import { Tooltip } from "../../../../../../components/Tooltip";
import { Button } from "../../../../../../components/ui/Button";
import { Form, FormField } from "../../../../../../components/ui/Form";
import { cn } from "../../../../../../utils";
import { useTableDataQuery } from "../../../../queries/useTableDataQuery";
import { PAGE_SIZE_OPTIONS, monacoOptions } from "./consts";
import { usePaginationState } from "./hooks/usePaginationState";
import { useSQLQueryState } from "./hooks/useSQLQueryState";
import { useMonacoSuggestions } from "./useMonacoSuggestions";
import { useQueryValidator } from "./useQueryValidator";
import { getLimitOffset } from "./utils/getLimitOffset";

type Props = {
  table?: Table;
  isLiveQuery: boolean;
  setIsLiveQuery: (isLiveQuery: boolean) => void;
};

export function SQLEditor({ table, isLiveQuery, setIsLiveQuery }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isUserTriggeredRefetch, setIsUserTriggeredRefetch] = useState(false);
  const [pagination, setPagination] = usePaginationState();
  const [query, setQuery] = useSQLQueryState();

  const validateQuery = useQueryValidator(table);
  const {
    data: tableData,
    refetch,
    isRefetching: isTableDataRefetching,
  } = useTableDataQuery({
    table,
    query,
    isLiveQuery,
  });
  const isRefetching = isTableDataRefetching && isUserTriggeredRefetch;
  useMonacoSuggestions(table);

  const form = useForm({
    defaultValues: {
      query,
    },
  });
  const currentQuery = form.watch("query");

  const handleSubmit = form.handleSubmit(({ query }) => {
    if (validateQuery(query)) {
      setQuery(query);

      // Set the page based on the query
      const { limit, offset } = getLimitOffset(query);
      if (limit == null || offset == null) {
        setPagination({
          ...pagination,
          pageIndex: 0,
        });
      } else if (PAGE_SIZE_OPTIONS.includes(limit) && (offset === 0 || offset % limit === 0)) {
        setPagination({
          pageSize: limit,
          pageIndex: offset / limit,
        });
      } else {
        setPagination({
          ...pagination,
          pageIndex: 0,
        });
      }

      setIsUserTriggeredRefetch(true);
      refetch().finally(() => setIsUserTriggeredRefetch(false));
    }
  });

  useEffect(() => {
    form.reset({ query });
  }, [query, form]);

  const updateHeight = () => {
    if (editorRef.current) {
      const contentHeight = Math.min(200, editorRef.current.getContentHeight());
      if (containerRef.current) {
        containerRef.current.style.height = `${contentHeight}px`;
      }

      editorRef.current.layout({
        width: editorRef.current.getLayoutInfo().width,
        height: contentHeight,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className={cn("relative w-full rounded-md border bg-black px-3 py-2 ring-offset-background", {
            "outline-none ring-2 ring-ring ring-offset-2": isFocused,
          })}
        >
          <FormField
            name="query"
            render={({ field }) => (
              <div ref={containerRef} className="min-h-[21px] w-full">
                <Editor
                  width="100%"
                  theme="vs-dark"
                  value={decodeURIComponent(field.value)}
                  options={monacoOptions}
                  language="sql"
                  onChange={(value) => field.onChange(encodeURIComponent(value ?? ""))}
                  onMount={(editor, monaco) => {
                    editorRef.current = editor;
                    monaco.editor.defineTheme("custom-vs-dark", {
                      base: "vs-dark",
                      inherit: true,
                      rules: [{ token: "string.sql", foreground: "#C5947C" }],
                      colors: {
                        "editor.background": "#000000",
                      },
                    });
                    monaco.editor.setTheme("custom-vs-dark");

                    editor.addAction({
                      id: "executeSQL",
                      label: "Execute SQL command",
                      keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
                      run: () => handleSubmit(),
                    });

                    updateHeight();
                    editor.onDidContentSizeChange(updateHeight);
                    editor.onDidFocusEditorText(() => setIsFocused(true));
                    editor.onDidBlurEditorText(() => setIsFocused(false));
                  }}
                  loading={null}
                />
              </div>
            )}
          />

          {currentQuery !== query ? (
            <span className="absolute right-1 top-[-6px] text-5xl text-primary">
              <span className="text-5xl text-primary">·</span>
            </span>
          ) : null}
        </div>

        <div className="flex justify-end gap-4">
          {tableData ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <Tooltip text="Execution time for the SQL query">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn("inline-block h-[6px] w-[6px] rounded-full bg-success", {
                        "animate-pulse": isLiveQuery,
                      })}
                    />
                    <span>{tableData ? Math.round(tableData.queryDuration) : 0}ms</span>
                  </span>
                </Tooltip>
                ·
                <span>
                  {tableData?.rows.length ?? 0} row{tableData?.rows.length !== 1 ? "s" : ""}
                </span>
              </span>

              <Tooltip text={isLiveQuery ? "Pause live query" : "Start live query"}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLiveQuery(!isLiveQuery);
                  }}
                >
                  {isLiveQuery ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                </Button>
              </Tooltip>
            </>
          ) : null}

          <Button className="group relative flex gap-2 pl-4 pr-3" type="submit" disabled={isRefetching}>
            Run
            <span className="relative flex items-center gap-0.5 text-white/60">
              <LoaderIcon className="absolute h-4 w-4 animate-spin opacity-0 group-disabled:opacity-100" />
              <span className="flex items-center gap-0.5 opacity-100 group-disabled:opacity-0">
                {navigator.platform.toLowerCase().includes("mac") ? (
                  <>
                    <CommandIcon className="h-3 w-3" />
                    <CornerDownLeft className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <span className="text-xs">CTRL</span>
                    <CornerDownLeft className="h-3 w-3" />
                  </>
                )}
              </span>
            </span>
          </Button>
        </div>
      </form>
    </Form>
  );
}
