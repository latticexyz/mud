import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Layers,
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
import { flatten, orderBy, throttle } from "lodash";
import { PositionFilterButton } from "./PositionFilterButton";
import { MAX_ENTITIES } from "../constants";
import { observe } from "mobx";

export const QueryBuilder = ({
  allEntities,
  setFilteredEntities,
  layers,
  world,
  devHighlightComponent,
  hoverHighlightComponent,
  clearDevHighlights,
  setOverflow,
}: {
  world: World;
  layers: Layers;
  allEntities: EntityID[];
  setFilteredEntities: (es: EntityID[]) => void;
  devHighlightComponent: Component<{ value: Type.OptionalNumber }>;
  hoverHighlightComponent: Component<{ x: Type.OptionalNumber; y: Type.OptionalNumber }>;
  clearDevHighlights: () => void;
  setOverflow: (overflow: number) => void;
}) => {
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

    const hasFilters = componentFilters.map((c) => `Has(${c.id})`);
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

  const cancelObserver = useRef<() => void>(() => void 0);
  // Cancel outstanding observers on unmount
  useEffect(() => {
    return () => {
      if (cancelObserver.current) cancelObserver.current();
    };
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
        const assignQueryVars = Object.keys(q)
          .map((key) => `const ${key} = q["${key}"]; `)
          .join("");

        const assignComponentVars = Object.keys(c)
          .map((key) => `const ${key} = c["${key}"]; `)
          .join("");

        const evalString = `
        (() => {
          ${assignQueryVars}
          ${assignComponentVars}
          return (${entityQueryText});
        })()
        `;

        const queryArray = eval(evalString) as EntityQueryFragment[];
        if (!queryArray || queryArray.length === 0 || !Array.isArray(queryArray)) {
          resetFilteredEntities();
          throw new Error("Invalid query");
        }

        cancelObserver.current();
        const queryResult = defineQuery(queryArray, { runOnInit: true });
        const subscription = queryResult.update$.subscribe();
        const selectEntities = throttle(
          () => {
            const selectedEntities = [...queryResult.matching].slice(0, MAX_ENTITIES);
            setOverflow(queryResult.matching.size - selectedEntities.length);
            setFilteredEntities(selectedEntities.map((idx) => world.entities[idx]));
            clearDevHighlights();
            selectedEntities.forEach((idx) => setComponent(devHighlightComponent, idx, { value: 0x0000ff }));
          },
          1000,
          { leading: true }
        );
        selectEntities();
        const cancelObserve = observe(queryResult.matching, selectEntities);
        cancelObserver.current = () => {
          cancelObserve();
          selectEntities.cancel();
          subscription?.unsubscribe();
        };
      } catch (e: unknown) {
        setErrorMessage((e as Error).message);
        console.error(e);
      }
    },
    [entityQueryText, setEntityQueryText, setFilteredEntities, resetFilteredEntities, setErrorMessage, allEntities]
  );

  return (
    <>
      <QueryBuilderForm onSubmit={executeFilter}>
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
          input={(layers.phaser as any)?.scenes.Main.phaserScene.input}
        />
        <ComponentBrowserButton onClick={() => {
          queryInputRef.current?.focus();
          editQuery('[Has(Selected)]');
        }}>
          View Selected Entity
        </ComponentBrowserButton>
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
