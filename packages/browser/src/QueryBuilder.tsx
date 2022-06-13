import React, { useState, useRef, useCallback, useEffect } from "react";
import { defineQuery, Layers, removeComponent, setComponent } from "@latticexyz/recs";
import { AnyComponent, QueryFragments } from "@latticexyz/recs/src/types";
import { ComponentBrowserButton, ComponentBrowserInput, QueryBuilderForm } from "./StyledComponents";
import * as recs from "@latticexyz/recs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QueryBuilder = function ({
  allEntities,
  setFilteredEntities,
  layers,
  devHighlightComponent
}: {
  layers: Layers;
  allEntities: [string, Set<AnyComponent>][];
  setFilteredEntities: (es: [string, Set<AnyComponent>][]) => void;
  devHighlightComponent: AnyComponent;
}) {
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [entityQueryText, setEntityQueryText] = useState("");
  /**
   * If there is no filter present, view all entities.
   */
  useEffect(() => {
    if (!entityQueryText) {
      setFilteredEntities(allEntities);
    }
  }, [setFilteredEntities, allEntities, entityQueryText]);

  const executeFilter = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();

      // Do not throw an error if there is no query
      if (!entityQueryText) {
        setFilteredEntities(allEntities);
        return;
      }

      /**
       * Create local variables that include all the things necessary to
       * construct custom Entity queries.
       */
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
          setFilteredEntities(allEntities);
          throw new Error("Invalid query");
        }

        const entityIds = defineQuery(queryArray).get();
        const selectedEntities = allEntities.filter(([id]) => entityIds.has(id));
        setFilteredEntities(selectedEntities);

        allEntities.forEach(([id]) => removeComponent(devHighlightComponent, id));
        selectedEntities.forEach(([id]) => setComponent(devHighlightComponent, id, { color: 0x0000ff }));
      } catch (e: unknown) {
        setEntityQueryText(entityQueryText + `\n${e}`);
        console.error(e);
      }
    },
    [entityQueryText, setEntityQueryText, setFilteredEntities, allEntities]
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
