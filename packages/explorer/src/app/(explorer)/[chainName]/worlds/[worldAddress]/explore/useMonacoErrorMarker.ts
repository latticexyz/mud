import { useCallback } from "react";
import { useMonaco } from "@monaco-editor/react";

export function useMonacoErrorMarker() {
  const monaco = useMonaco();
  return useCallback(
    ({ message, startColumn, endColumn }: { message: string; startColumn: number; endColumn: number }) => {
      if (monaco) {
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
      }
    },
    [monaco],
  );
}
