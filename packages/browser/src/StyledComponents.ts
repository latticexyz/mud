import styled from "styled-components";

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

export const ComponentBrowserButton = styled.button`
  background-color: #383c4a;
  color: #8c91a0;
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
  grid-column: 3;
  grid-row-start: 1;
  grid-row-end: 4;
  pointer-events: all;
  max-height: 100%;
  overflow: auto;

  width: 300px;
  justify-self: end;

  background-color: rgba(27, 28, 32, 1);
  color: #8c91a0;
`;

export const QueryBuilderForm = styled.form`
  padding: 8px;
  border-bottom: 2px grey solid;
  margin-bottom: 8px;
  width: 100%;
`;
