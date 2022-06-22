import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Layers,
  removeComponent,
  setComponent,
  Type,
  AnyComponent,
  Component,
  QueryFragments,
  runQuery,
  Entity,
} from "@latticexyz/recs";
import { ComponentBrowserButton, ComponentBrowserInput, QueryBuilderForm } from "./StyledComponents";
import * as recs from "@latticexyz/recs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QueryBuilder = function ({
  allEntities,
  setFilteredEntities,
  layers,
  devHighlightComponent,
}: {
  layers: Layers;
  allEntities: [Entity, Set<AnyComponent>][];
  setFilteredEntities: (es: [Entity, Set<AnyComponent>][]) => void;
  devHighlightComponent: Component<{ color: Type.OptionalNumber }>;
}) {
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [entityQueryText, setEntityQueryText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetFilteredEntities = useCallback(() => {
    setFilteredEntities(allEntities);
    setErrorMessage("");
  }, [setFilteredEntities, setErrorMessage, allEntities]);

  // If there is no filter present, view all entities.
  useEffect(() => {
    if (!entityQueryText) {
      resetFilteredEntities();
    }
  }, [setFilteredEntities, resetFilteredEntities, allEntities, entityQueryText]);

  const executeFilter = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      // Do not throw an error if there is no query
      if (!entityQueryText) {
        resetFilteredEntities();
        return;
      }

      // Create local variables that include all the things necessary to
      // construct custom Entity queries.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const q = { ...recs };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const c = Object.values(layers).reduce<Record<string, AnyComponent>>((allComponents, layer) => {
        for (const [componentName, component] of Object.entries(layer.components)) {
          allComponents[componentName] = component;
        }
        return allComponents;
      }, {});

      try {
        const queryArray = eval(entityQueryText) as QueryFragments;
        if (!queryArray || queryArray.length === 0 || !Array.isArray(queryArray)) {
          resetFilteredEntities();
          throw new Error("Invalid query");
        }

        const entityIds = runQuery(queryArray);
        const selectedEntities = allEntities.filter(([id]) => entityIds.has(id));
        setFilteredEntities(selectedEntities);

        allEntities.forEach(([id]) => removeComponent(devHighlightComponent, id));
        selectedEntities.forEach(([id]) => setComponent(devHighlightComponent, id, { color: 0x0000ff }));
      } catch (e: unknown) {
        setErrorMessage((e as Error).message);
        console.error(e);
      }
    },
    [entityQueryText, setEntityQueryText, setFilteredEntities, resetFilteredEntities, setErrorMessage, allEntities]
  );

  return (
    <>
      <QueryBuilderForm
        onSubmit={(e) => {
          e.preventDefault();
          queryInputRef.current?.blur();
        }}
      >
        <SyntaxHighlighter wrapLongLines language="javascript" style={dracula}>
          {entityQueryText}
        </SyntaxHighlighter>
        {errorMessage && (
          <SyntaxHighlighter wrapLongLines language="javascript" style={dracula}>
            {`Error: ${errorMessage}`}
          </SyntaxHighlighter>
        )}
        <label style={{ cursor: "pointer" }} htmlFor={`query-input`}>
          <h3>Filter Entities</h3>
        </label>
        <ComponentBrowserInput
          id="query-input"
          ref={queryInputRef}
          placeholder="No filter applied"
          style={{ width: "100%", color: "white" }}
          type="text"
          value={entityQueryText}
          onChange={(e) => {
            if (errorMessage) setErrorMessage("");
            setEntityQueryText(e.target.value);
          }}
          onFocus={(e) => e.target.select()}
          onBlur={(e) => executeFilter(e)}
        />
      </QueryBuilderForm>

      <div
        style={{
          padding: "8px",
          paddingTop: 0,
          borderBottom: "2px grey solid",
        }}
      >
        <h3>Query Shortcuts</h3>
        <div style={{ flex: "row wrap", marginTop: "8px" }}>
          <ComponentBrowserButton
            onClick={() => {
              setEntityQueryText("[q.Has(c.LocalPosition)]");
              queryInputRef.current?.focus();
            }}
          >
            Has(LocalPosition)
          </ComponentBrowserButton>

          <ComponentBrowserButton
            onClick={() => {
              setEntityQueryText("[q.Has(c.Position)]");
              queryInputRef.current?.focus();
            }}
          >
            Has(Position)
          </ComponentBrowserButton>
        </div>
      </div>
    </>
  );
};
