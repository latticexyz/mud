import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Layers,
  removeComponent,
  setComponent,
  Type,
  AnyComponent,
  Component,
  EntityID,
  World,
  defineQuery,
  EntityQueryFragment,
} from "@latticexyz/recs";
import { ComponentBrowserButton, ComponentBrowserInput } from "../StyledComponents";
import { QueryBuilderForm, QueryShortcutContainer } from "./StyledComponents";
import * as recs from "@latticexyz/recs";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { flatten, orderBy } from "lodash";
import { PositionFilterButton } from "./PositionFilterButton";

export const QueryBuilder = function ({
  allEntities,
  setFilteredEntities,
  layers,
  world,
  devHighlightComponent,
  hoverHighlightComponent,
}: {
  world: World;
  layers: Layers;
  allEntities: EntityID[];
  setFilteredEntities: (es: EntityID[]) => void;
  devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
}) {
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [componentFilters, setComponentFilters] = useState<AnyComponent[]>([]);
  const [isManuallyEditing, setIsManuallyEditing] = useState(true);
  const [entityQueryText, setEntityQueryText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const allComponents = flatten(Object.values(layers).map((layer) => Object.values(layer.components)));

  const resetFilteredEntities = useCallback(() => {
    setFilteredEntities([]);
    setComponentFilters([]);
    setErrorMessage("");
  }, [setFilteredEntities, setErrorMessage, allEntities]);

  // If there is no filter present, view no entities.
  useEffect(() => {
    if (!entityQueryText) {
      resetFilteredEntities();
    }
  }, [setFilteredEntities, resetFilteredEntities, allEntities, entityQueryText]);

  // If the user is not manually typing a query, build a query
  // based on the selected Component filters
  useEffect(() => {
    if (isManuallyEditing) return;

    const hasFilters = componentFilters.map((c) => `q.Has(c.${c.id})`);
    const query = `[${hasFilters.join(",")}]`;
    setEntityQueryText(query);
  }, [componentFilters, isManuallyEditing]);

  // When the user edits a query manually,
  // clear the selectable filters
  const editQuery = useCallback((text: string) => {
    setIsManuallyEditing(true);
    setEntityQueryText(text);
    setComponentFilters([]);
  }, []);

  const executeFilter = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      setErrorMessage("");

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
        const queryArray = eval(entityQueryText) as EntityQueryFragment[];
        if (!queryArray || queryArray.length === 0 || !Array.isArray(queryArray)) {
          resetFilteredEntities();
          throw new Error("Invalid query");
        }

        const selectedEntities = defineQuery(queryArray, { runOnInit: true }).matching;
        setFilteredEntities([...selectedEntities].map((idx) => world.entities[idx]));

        selectedEntities.forEach((idx) => removeComponent(devHighlightComponent, idx));
        selectedEntities.forEach((idx) => setComponent(devHighlightComponent, idx, { value: 0x0000ff }));
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
            editQuery(e.target.value);
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
        <h2>Query Shortcuts</h2>
        <PositionFilterButton
          editQuery={editQuery}
          hoverHighlightComponent={hoverHighlightComponent}
          queryInputRef={queryInputRef}
        />
        <h3>Filter by Component</h3>
        <QueryShortcutContainer style={{ margin: "8px auto" }}>
          {orderBy(allComponents, (c) => c.id)
            .filter((c) => !c.id.includes("-"))
            .map((component) => {
              const filterActive = componentFilters.includes(component);

              return (
                <ComponentBrowserButton
                  key={`filter-toggle-${component.id}`}
                  active={filterActive}
                  onClick={() => {
                    setIsManuallyEditing(false);
                    queryInputRef.current?.focus();

                    if (filterActive) {
                      setComponentFilters((f) => f.filter((f) => f !== component));
                    } else {
                      setComponentFilters((f) => [...f, component]);
                    }
                  }}
                >
                  Has({component.id})
                </ComponentBrowserButton>
              );
            })}
        </QueryShortcutContainer>
      </div>
    </>
  );
};
