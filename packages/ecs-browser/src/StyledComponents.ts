import { styled } from "goober";

export const ComponentBrowserInput = styled.input`
  background-color: #383c4a;
  color: #8c91a0;
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
  padding-left: 8px;
  margin: 8px 0;

  &:focus {
    outline: none;
    border: 1px #8c91a0 solid;
  }
  ::selection {
    color: white;
    background: rgba(70, 89, 182, 0.9);
  }
`;

export const ComponentBrowserButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? "#8c91a0" : "#383c4a")};
  color: ${({ active }) => (active ? "#383c4a" : "#8c91a0")};
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;

  &:hover {
    background-color: #8c91a0;
    color: #383c4a;
  }
`;

export const ComponentBrowserSelect = styled.select`
  width: 180px;
  background-color: #383c4a;
  color: #8c91a0;
  border: 1px rgba(0, 0, 0, 0.5) solid;
  border-radius: 4px;
  padding: 4px;
`;

export const ValueForm = styled.form`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const ComponentEditorContainer = styled.div`
  margin: 8px auto;
`;

export const ComponentTitle = styled.div`
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const EntityEditorContainer = styled.div`
  border-bottom: 1px #8c91a0 solid;
  padding: 8px;
`;

export const BrowserContainer = styled.div`
  overflow: auto;
  background-color: rgba(27, 28, 32, 1);
  color: #8c91a0;
  height: 100%;
  pointer-events: all;
`;

export const DraggableNumberLabelContainer = styled.label`
  cursor: ew-resize;
  user-select: none;
  color: #8c91a0;
`;

export const SmallHeadline = styled.p`
  padding: 8px;
  font-size: 14px;
`;

export const Collapse = styled.div<{ opened: boolean }>`
  height: ${({ opened }) => (opened ? "auto" : "0px")};
  overflow: ${({ opened }) => (opened ? "initial" : "hidden")};
`;

export const SyntaxHighlighterWrapper = styled.div`
  .shiki {
    background-color: #282a36;

    font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;

    line-height: 1.5;
    tab-size: 4;
    hyphens: none;
    padding: 1em;
    margin: 0.5em 0px;
    overflow: auto;
    border-radius: 0.3em;
    overflow: auto;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    text-shadow: rgba(0, 0, 0, 0.3) 0px 1px;
  }
`;
