import { describe, beforeEach, it } from "vitest";
import { StoreApi, createStore } from "zustand/vanilla";

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

type Store = {
  namespaces: {
    app: {
      Position: Record<string, PositionSchema>;
      Name: Record<string, NameSchema>;
    };
  };
  setPosition: (entity: string, position: PositionSchema) => void;
};

describe("setting records in zustand", () => {
  let store: StoreApi<Store>;

  beforeEach(() => {
    store = createStore<Store>((set) => ({
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
