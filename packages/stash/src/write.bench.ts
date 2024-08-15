import { describe, bench } from "vitest";
import { StoreApi, createStore } from "zustand/vanilla";
import { Component, Type, createEntity, createWorld, defineComponent, setComponent } from "@latticexyz/recs";
import { mutative } from "zustand-mutative";

export function printDuration(description: string, fn: () => unknown) {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  console.log(description, duration);
  return duration;
}

type PositionSchema = {
  x: number;
  y: number;
};

type NameSchema = {
  name: string;
};

type State = {
  namespaces: {
    app: {
      Position: Record<string, PositionSchema>;
      Name: Record<string, NameSchema>;
    };
  };
};

type Actions = {
  setPositions: (positions: { [entity: string]: PositionSchema }) => void;
};

let prefix = 0;
function generatePositions(numRecords: number): Record<string, PositionSchema> {
  prefix++;
  const positions: Record<string, PositionSchema> = {};
  for (let i = 0; i < numRecords; i++) {
    positions[String(prefix) + "-" + String(i)] = { x: i, y: i };
  }
  return positions;
}

describe.skip.each([
  { initialRecords: 1_000, newRecords: 1 },
  { initialRecords: 1_000, newRecords: 100 },
  { initialRecords: 10_000, newRecords: 1 },
  { initialRecords: 10_000, newRecords: 100 },
  { initialRecords: 100_000, newRecords: 1 },
  { initialRecords: 100_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1 },
  { initialRecords: 1_000_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1_000 },
  { initialRecords: 1_000_000, newRecords: 10_000 },
  { initialRecords: 1_000_000, newRecords: 100_000 },
])(
  "[zustand]: setting $newRecords records in a stash with $initialRecords records",
  ({ initialRecords, newRecords }) => {
    let stash: StoreApi<State & Actions>;
    let positions: Record<string, PositionSchema>;

    function setupStore(numRecords: number) {
      // Create stash
      stash = createStore<State & Actions>((set) => ({
        namespaces: {
          app: {
            Position: {
              "0x": {
                x: 0,
                y: 0,
              },
            },
            Name: {
              "0x": {
                name: "Some Name",
              },
            },
          },
        },
        setPositions: (positions: { [entity: string]: PositionSchema }) =>
          set((prev) => ({
            namespaces: {
              app: {
                ...prev.namespaces.app,
                Position: {
                  ...prev.namespaces.app.Position,
                  ...positions,
                },
              },
            },
          })),
      }));

      // Initialize stash with specified number of records
      stash.getState().setPositions(generatePositions(numRecords));
    }

    bench(
      "bench",
      () => {
        stash.getState().setPositions(positions);
      },
      {
        setup: () => {
          setupStore(initialRecords);
          positions = generatePositions(newRecords);
        },
        iterations: 3,
      },
    );
  },
);

describe.skip.each([
  { initialRecords: 1_000, newRecords: 1 },
  { initialRecords: 1_000, newRecords: 100 },
  { initialRecords: 10_000, newRecords: 1 },
  { initialRecords: 10_000, newRecords: 100 },
  { initialRecords: 100_000, newRecords: 1 },
  { initialRecords: 100_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1 },
  { initialRecords: 1_000_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1_000 },
  { initialRecords: 1_000_000, newRecords: 10_000 },
  { initialRecords: 1_000_000, newRecords: 100_000 },
])(
  "[zustand-mutative]: setting $newRecords records in a stash with $initialRecords records",
  ({ initialRecords, newRecords }) => {
    let stash: StoreApi<State & Actions>;
    let positions: Record<string, PositionSchema>;

    function setupStore(numRecords: number) {
      // Create stash
      stash = createStore<State & Actions>()(
        mutative((set) => ({
          namespaces: {
            app: {
              Position: {
                "0x": {
                  x: 0,
                  y: 0,
                },
              },
              Name: {
                "0x": {
                  name: "Some Name",
                },
              },
            },
          },
          setPositions: (positions: { [entity: string]: PositionSchema }) =>
            set((prev) => {
              for (const [entity, position] of Object.entries(positions)) {
                prev.namespaces.app.Position[entity] = position;
              }
            }),
        })),
      );

      // Initialize stash with specified number of records
      stash.getState().setPositions(generatePositions(numRecords));
    }

    bench(
      "bench",
      () => {
        stash.getState().setPositions(positions);
      },
      {
        setup: () => {
          setupStore(initialRecords);
          positions = generatePositions(newRecords);
        },
        iterations: 3,
      },
    );
  },
);

describe.skip.each([
  { initialRecords: 1_000, newRecords: 1 },
  { initialRecords: 1_000, newRecords: 100 },
  { initialRecords: 10_000, newRecords: 1 },
  { initialRecords: 10_000, newRecords: 100 },
  { initialRecords: 100_000, newRecords: 1 },
  { initialRecords: 100_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1 },
  { initialRecords: 1_000_000, newRecords: 100 },
  { initialRecords: 1_000_000, newRecords: 1_000 },
  { initialRecords: 1_000_000, newRecords: 10_000 },
  // { initialRecords: 1_000_000, newRecords: 100_000 },
])("[recs]: setting $newRecords records in a stash with $initialRecords records", ({ initialRecords, newRecords }) => {
  let world: ReturnType<typeof createWorld>;
  let positions: Record<string, PositionSchema>;
  let Position: Component<{ x: Type.Number; y: Type.Number }>;

  function setupStore(numRecords: number) {
    world = createWorld();
    defineComponent(world, { name: Type.String });
    Position = defineComponent(world, { x: Type.Number, y: Type.Number });

    // Initialize Position component with specified number of records
    const initialPositions = generatePositions(numRecords);
    for (const position of Object.values(initialPositions)) {
      const entity = createEntity(world);
      setComponent(Position, entity, position);
    }
  }

  bench(
    "bench",
    () => {
      for (const position of Object.values(positions)) {
        const entity = createEntity(world);
        setComponent(Position, entity, position);
      }
    },
    {
      setup: () => {
        setupStore(initialRecords);
        positions = generatePositions(newRecords);
      },
      iterations: 3,
    },
  );
});
