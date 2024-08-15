import { describe, beforeEach, it } from "vitest";
import { StoreApi, createStore as createZustandStore } from "zustand/vanilla";
import { Component, Type, createEntity, createWorld, defineComponent, setComponent } from "@latticexyz/recs";
import { mutative } from "zustand-mutative";
import { defineStore } from "@latticexyz/store/config/v2";
import { CreateStoreResult, createStore } from "./createStash";

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
  setPosition: (entity: string, position: PositionSchema) => void;
};

describe.skip("setting records in recs", () => {
  let world: ReturnType<typeof createWorld>;
  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;

  beforeEach(() => {
    world = createWorld();
    defineComponent(world, { name: Type.String });
    Position = defineComponent(world, { x: Type.Number, y: Type.Number });
  });

  it("[recs]: setting 10 records", () => {
    printDuration("setting 10 records", () => {
      for (let i = 0; i < 10; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 100 records", () => {
    printDuration("setting 100 records", () => {
      for (let i = 0; i < 100; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 1,000 records", () => {
    printDuration("setting 1,000 records", () => {
      for (let i = 0; i < 1_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 5,000 records", () => {
    printDuration("setting 5,000 records", () => {
      for (let i = 0; i < 5_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 10,000 records", () => {
    printDuration("setting 10,000 records", () => {
      for (let i = 0; i < 10_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 15,000 records", () => {
    printDuration("setting 15,000 records", () => {
      for (let i = 0; i < 15_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 20,000 records", () => {
    printDuration("setting 20,000 records", () => {
      for (let i = 0; i < 20_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 50,000 records", () => {
    printDuration("setting 50,000 records", () => {
      for (let i = 0; i < 50_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 100,000 records", () => {
    printDuration("setting 100,000 records", () => {
      for (let i = 0; i < 100_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });

  it("[recs]: setting 1,000,000 records", () => {
    printDuration("setting 1,000,000 records", () => {
      for (let i = 0; i < 1_000_000; i++) {
        const entity = createEntity(world);
        setComponent(Position, entity, { x: i, y: i });
      }
    });
  });
});

describe.skip("setting records in stash", () => {
  let store: CreateStoreResult;
  const config = defineStore({
    tables: {
      Position: {
        schema: { player: "address", x: "uint32", y: "uint32" },
        key: ["player"],
      },
    },
  });
  const Position = config.tables.Position;

  beforeEach(() => {
    store = createStore(config);
  });

  it("[stash]: setting 10 records", () => {
    printDuration("setting 10 records", () => {
      for (let i = 0; i < 10; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 100 records", () => {
    printDuration("setting 100 records", () => {
      for (let i = 0; i < 100; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 1,000 records", () => {
    printDuration("setting 1,000 records", () => {
      for (let i = 0; i < 1_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 5,000 records", () => {
    printDuration("setting 5,000 records", () => {
      for (let i = 0; i < 5_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 10,000 records", () => {
    printDuration("setting 10,000 records", () => {
      for (let i = 0; i < 10_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 15,000 records", () => {
    printDuration("setting 15,000 records", () => {
      for (let i = 0; i < 15_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 20,000 records", () => {
    printDuration("setting 20,000 records", () => {
      for (let i = 0; i < 20_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 50,000 records", () => {
    printDuration("setting 50,000 records", () => {
      for (let i = 0; i < 50_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 100,000 records", () => {
    printDuration("setting 100,000 records", () => {
      for (let i = 0; i < 100_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });

  it("[stash]: setting 1,000,000 records", () => {
    printDuration("setting 1,000,000 records", () => {
      for (let i = 0; i < 1_000_000; i++) {
        store.setRecord({ table: Position, key: { player: `0x${i}` }, record: { x: i, y: i } });
      }
    });
  });
});

describe.skip("setting records in zustand", () => {
  let store: StoreApi<State & Actions>;

  beforeEach(() => {
    store = createZustandStore<State & Actions>((set) => ({
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
      setPosition: (entity: string, position: PositionSchema) =>
        set((prev) => ({
          namespaces: {
            app: {
              ...prev.namespaces.app,
              Position: {
                ...prev.namespaces.app.Position,
                [entity]: position,
              },
            },
          },
        })),
    }));
  });

  it("[zustand]: setting 10 records", () => {
    printDuration("setting 10 records", () => {
      for (let i = 0; i < 10; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 100 records", () => {
    printDuration("setting 100 records", () => {
      for (let i = 0; i < 100; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 1,000 records", () => {
    printDuration("setting 1,000 records", () => {
      for (let i = 0; i < 1_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 5,000 records", () => {
    printDuration("setting 5,000 records", () => {
      for (let i = 0; i < 5_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 10,000 records", () => {
    printDuration("setting 10,000 records", () => {
      for (let i = 0; i < 10_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 15,000 records", () => {
    printDuration("setting 15,000 records", () => {
      for (let i = 0; i < 15_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand]: setting 20,000 records", () => {
    printDuration("setting 20,000 records", () => {
      for (let i = 0; i < 20_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });
});

describe.skip("setting records in zustand with mutative", () => {
  let store: StoreApi<State & Actions>;

  beforeEach(() => {
    store = createZustandStore<State & Actions>()(
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
        setPosition: (entity: string, position: PositionSchema) =>
          set((state) => {
            state.namespaces.app.Position[entity] = position;
          }),
      })),
    );
  });

  it("[zustand mutative]: setting 10 records", () => {
    printDuration("setting 10 records", () => {
      for (let i = 0; i < 10; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 100 records", () => {
    printDuration("setting 100 records", () => {
      for (let i = 0; i < 100; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 1,000 records", () => {
    printDuration("setting 1,000 records", () => {
      for (let i = 0; i < 1_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 5,000 records", () => {
    printDuration("setting 5,000 records", () => {
      for (let i = 0; i < 5_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 10,000 records", () => {
    printDuration("setting 10,000 records", () => {
      for (let i = 0; i < 10_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 15,000 records", () => {
    printDuration("setting 15,000 records", () => {
      for (let i = 0; i < 15_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 20,000 records", () => {
    printDuration("setting 20,000 records", () => {
      for (let i = 0; i < 20_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 30,000 records", () => {
    printDuration("setting 30,000 records", () => {
      for (let i = 0; i < 30_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });

  it("[zustand mutative]: setting 40,000 records", () => {
    printDuration("setting 40,000 records", () => {
      for (let i = 0; i < 40_000; i++) {
        store.getState().setPosition(String(i), { x: i, y: i });
      }
    });
  });
});
