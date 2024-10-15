"use client";

import { KeyCode, KeyMod, editor } from "monaco-editor/esm/vs/editor/editor.api.js";
import { useQueryState } from "nuqs";
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import Editor, { Monaco, useMonaco } from "@monaco-editor/react";
import { cn } from "../../../../../../utils";

type WrapperProps = {
  isFocused: boolean;
  isReadOnly: boolean;
};

// TODO: bring back?
// const Wrapper = styled.div<WrapperProps>`
//   & .monaco-editor,
//   .monaco-editor-background,
//   .monaco-editor .inputarea.ime-input {
//     cursor: ${(props) => (props.isReadOnly ? "not-allowed" : "text")};
//     background-color: ${(props) => (props.isReadOnly ? "#eceaea" : "white")}!important;
//   }

//   & .monaco-editor,
//   .monaco-editor-background,
//   .monaco-editor .view-lines {
//     cursor: ${(props) => (props.isReadOnly ? "not-allowed" : "text")};
//   }
// `;

// TODO: bring back?
// const Fill = styled.div`
//   position: absolute;
//   width: 100%;
//   max-height: 100%;
//   top: 0;
//   font-weight: normal;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   left: 0;
//   z-index: 1;
//   padding: 8px 8px;
//   font-family: Menlo, Monaco, "Courier New", monospace;
//   font-weight: normal;
//   font-size: 14px;
//   font-feature-settings:
//     "liga" 0,
//     "calt" 0;
//   line-height: 21px;
//   letter-spacing: 0px;
// `;

// this code is inspired from https://github.com/vikyd/vue-monaco-singleline/blob/master/src/monaco-singleline.vue
const DefaultOptions: editor.IStandaloneEditorConstructionOptions = {
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
    // avoid can not scroll page when hover monaco
    alwaysConsumeMouseWheel: false,
    // disables scroll
    handleMouseWheel: false,
  },
  // disable `Find`
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "never",
  },
  minimap: { enabled: false },
  // see: https://github.com/microsoft/monaco-editor/issues/1746
  wordBasedSuggestions: "off",
  // avoid links underline
  links: false,
  // avoid highlight hover word
  occurrencesHighlight: "off",
  cursorStyle: "line-thin",
  // hide current row highlight grey border
  // see: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html#renderlinehighlight
  renderLineHighlight: "none",
  contextmenu: false,
  // default selection is rounded
  roundedSelection: false,
  hover: {
    // unit: ms
    // default: 300
    delay: 100,
  },
  acceptSuggestionOnEnter: "on",
  // auto adjust width and height to parent
  // see: https://github.com/Microsoft/monaco-editor/issues/543#issuecomment-321767059
  automaticLayout: true,
  // if monaco is inside a table, hover tips or completion may cause table body scroll
  fixedOverflowWidgets: true,
};

type EditorSmallInputProps = {
  placeholder?: string;
  value: string;
  readOnly?: boolean;
  focusOnMount?: boolean;
  onChange?: (value: string) => void;
  onInstance?: (instance: editor.IStandaloneCodeEditor) => void;
};

const MAX_LINES = 1;
const placeholder = "some placeholder";
const focusOnMount = false;
const readOnly = false;
const initialValue = "SELECT * FROM foo";

// this is not a controlled component
const EditorSmallInput = ({ onChange }: EditorSmallInputProps) => {
  const monaco = useMonaco();

  const [value, setValue] = useQueryState("query"); // useState(initialValue);

  const [model, setModel] = useState<editor.ITextModel>();
  const [instance, setInstance] = useState<editor.IStandaloneCodeEditor>();
  const [isFocused, setIsFocused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);

  useEffect(() => {
    if (!model || !instance) {
      return;
    }

    // if suggest widget is visible, do not change model (because it will hide it)
    if (isSuggestionsVisible) {
      return;
    }

    // if someone typed character that might open suggest widget
    // so we need to wait for it to close before changing model
    // it will be better for user experience
    if (
      !model.isDisposed() &&
      (initialValue.match(/{/g) ?? []).length >= (model.getValue().match(/{/g) ?? []).length &&
      instance.hasTextFocus()
    ) {
      return;
    }

    // we save the cursor position and restore it after model change
    const position = instance.getPosition();

    if (!model.isDisposed()) {
      model.setValue(initialValue);
    }

    if (position) {
      instance.setPosition(position);
    }
  }, [isSuggestionsVisible, model, instance]);

  useEffect(() => {
    if (!instance || !monaco) {
      return;
    }

    // there is no optimal way of checking if suggest widget is visible
    // we needed to do it this way
    // https://stackoverflow.com/questions/59973144/check-if-suggestions-widget-is-opened-in-monaco-editor
    const suggestionWidget = (instance.getContribution("editor.contrib.suggestController") as any)?.widget;

    if (suggestionWidget) {
      suggestionWidget.value.onDidShow(() => {
        setIsSuggestionsVisible(true);
      });
      suggestionWidget.value.onDidHide(() => {
        setIsSuggestionsVisible(false);
      });
    } else {
      setIsSuggestionsVisible(false);
    }

    // TODO: is any of it needed?
    // const newModel = monaco.editor.createModel(initialValue, languageId);

    // instance.setModel(newModel);
    // setModel(newModel);

    if (focusOnMount) {
      instance.focus();
      // and set position to end
      instance.setPosition({
        lineNumber: MAX_LINES,
        column: initialValue.length + 1,
      });
    }

    const blockContext =
      "editorTextFocus && !suggestWidgetVisible && !renameInputVisible && !inSnippetMode " +
      "&& !quickFixWidgetVisible";

    // disable `F1` command palette
    instance.addAction({
      id: "disable_command-palette",
      label: "Execute Block",
      keybindings: [KeyCode.F1],
      contextMenuGroupId: "2_execution",
      precondition: blockContext,
      run: () => {
        return;
      },
    });

    // disable `Find` widget
    instance.addAction({
      id: "prevent_find",
      label: "Execute Block",
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyF],
      contextMenuGroupId: "2_execution",
      precondition: blockContext,
      run: () => {
        return;
      },
    });

    // you can disable Enter if you want or remove the lines bellow
    //
    // disable press `Enter` in case of producing line breaks
    // instance.addAction({
    //   id: "prevent_enter",
    //   label: "Execute Block",
    //   keybindings: [KeyCode.Enter],
    //   contextMenuGroupId: "2_execution",
    //   precondition: blockContext,
    //   run: () => {
    //     // enter only should trigger accepting of suggestion
    //     instance.trigger("", "acceptSelectedSuggestion", "");
    //   },
    // });

    // deal with user paste
    // see: https://github.com/microsoft/monaco-editor/issues/2009#issue-63987720
    const { dispose: disposePaste } = instance.onDidPaste((e) => {
      const content = instance.getValue();
      const lines = content.split("\n");

      if (lines.length <= MAX_LINES) {
        return;
      }

      // multiple rows will be merged to single row
      instance.setValue(lines.join(""));
      instance.setPosition({
        column: lines.join("").length + 1,
        lineNumber: MAX_LINES,
      });
    });

    // handle cursor going to > MAX_LINES line
    const { dispose: disposeCursorChange } = instance.onDidChangeCursorPosition((e) => {
      // Monaco tells us the line number after cursor position changed
      if (e.position.lineNumber > MAX_LINES) {
        // Trim editor value
        instance.setValue(instance.getValue().trim());
        // Bring back the cursor to the end of the first line
        instance.setPosition({
          ...e.position,
          // Setting column to Infinity would mean the end of the line
          column: Infinity,
          lineNumber: MAX_LINES,
        });
      }
    });

    const { dispose: disposeFocus } = instance.onDidFocusEditorText(() => {
      setIsFocused(true);
    });

    const { dispose: disposeBlur } = instance.onDidBlurEditorText(() => {
      setIsFocused(false);
    });

    return () => {
      disposeCursorChange();
      disposePaste();
      disposeFocus();
      disposeBlur();

      // TODO: is it needed?
      // newModel.dispose();
    };
  }, [instance, monaco]);

  const onMount = (instance: editor.IStandaloneCodeEditor) => {
    setIsMounted(true);
    setInstance(instance);
  };

  const handlePlaceholderClick = () => {
    if (!instance) {
      return;
    }

    instance.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    // this handler will be called even when we change model
    // so we need to check if value actually changed
    if (value && value !== initialValue) {
      if (onChange) {
        onChange(value);
      }
    }

    setValue(value ?? "");
  };

  return (
    <div
      className={cn(
        `relative flex h-10 max-h-10 w-full flex-grow items-center justify-center rounded-md border bg-black px-3 py-2 align-middle ring-offset-2 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-visible:ring-2`,
        // {
        //   "cursor-not-allowed bg-[#eceaea]": readOnly,
        //   "bg-white": !readOnly,
        // },
      )}
    >
      {/* TODO: add back? */}
      {/* {placeholder && !isFocused && value.length === 0 && (
        <div className="absolute left-0 z-10 ml-3" onClick={handlePlaceholderClick}>
          <p className="mb-0 text-sm font-normal text-gray-400">{placeholder}</p>
        </div>
      )} */}

      {/* TODO: add back? */}
      {/* {!isMounted && (
        <Fill
          className={cn({
            "cursor-not-allowed bg-gray-50": readOnly,
            "bg-white": !readOnly,
          })}
        >
          {initialValue}
        </Fill>
      )} */}

      <Editor
        width="100%"
        theme="hc-black"
        options={{
          ...DefaultOptions,
          readOnly: readOnly ?? false,
        }}
        language="sql"
        onChange={handleEditorChange}
        onMount={onMount}
      />
    </div>
  );
};

export { EditorSmallInput };
