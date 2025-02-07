import { editor } from "monaco-editor/esm/vs/editor/editor.api";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50, 100];

export const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontWeight: "normal",
  wordWrap: "on",
  wrappingStrategy: "advanced",
  lineNumbers: "off",
  lineNumbersMinChars: 0,
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  lineDecorationsWidth: 0,
  glyphMargin: false,
  folding: false,
  scrollBeyondLastColumn: 0,
  scrollBeyondLastLine: false,
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

export const monacoSuggestionsMap = {
  KEYWORD: "Keyword",
  TABLE: "Field",
  COLUMN: "Field",
} as const;

export const suggestedSQLKeywords = [
  // Basic queries
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Joins
  "JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "ON",
  // Aggregates
  "COUNT",
  "SUM",
  "AVG",
  "MAX",
  "MIN",
  // Conditions
  "AND",
  "OR",
  "NOT",
  "IN",
  "BETWEEN",
  "LIKE",
  "IS NULL",
  "IS NOT NULL",
  // Other clauses
  "HAVING",
  "DISTINCT",
  "AS",
  "WITH",
  // Sorting
  "ASC",
  "DESC",
  // Set operations
  "UNION",
  "UNION ALL",
  "INTERSECT",
  "EXCEPT",
] as const;
export type SuggestedSQLKeyword = (typeof suggestedSQLKeywords)[number];
