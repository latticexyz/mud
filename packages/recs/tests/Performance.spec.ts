import { defineComponent as defineComponentV2, setComponent as setComponentV2 } from "../src/Component";
import { createWorld as createWorldV2 } from "../src/World";
import { createEntity as createEntityV2 } from "../src/Entity";
import { Type as TypeV2 } from "../src/constants";
import { HasValue as HasValueV2 } from "../src/Query";
import { defineSystem } from "../src/System";

export function timeIt(fn: () => unknown) {
  const start = Date.now();
  fn();
  const end = Date.now();
  const duration = end - start;
  console.log("Duration:", duration);
  return duration;
}

describe("V2", () => {
  const size = 1000000;
  it("measure creation of 1000000 entities", () => {
    console.log("V2");
    const world = createWorldV2();
    const Position = defineComponentV2(world, { x: TypeV2.Number, y: TypeV2.Number });

    timeIt(() => {
      for (let i = 0; i < size; i++) {
        const entity = createEntityV2(world);
        setComponentV2(Position, entity, { x: 1, y: 1 });
      }
    });
  });

  it("measure creation of 1000000 entities and reacting to it", () => {
    console.log("V2");
    const world = createWorldV2();
    const Position = defineComponentV2(world, { x: TypeV2.Number, y: TypeV2.Number });

    defineSystem(world, [HasValueV2(Position, { x: 1, y: 1 })], (update) => {
      const e = update;
    });

    timeIt(() => {
      for (let i = 0; i < size; i++) {
        const entity = createEntityV2(world);
        setComponentV2(Position, entity, { x: 1, y: 1 });
      }
    });
  });
});

describe("TypedArray", () => {
  let array: number[];
  let typedArray: Uint32Array;
  const size = 10000000;

  beforeAll(() => {
    // Set up array
    array = [];
    const randomOtherArr: number[] = [];
    for (let i = 0; i < size; i++) {
      array.push(i);
      randomOtherArr.push(i);
    }

    // Set up buffer
    const buffer = new ArrayBuffer(4 * size);
    typedArray = new Uint32Array(buffer);

    for (let i = 0; i < size; i++) {
      typedArray[i] = i;
    }
  });

  it.skip("measure time to create 10 million entite", () => {
    console.log("Sparse array");
    const sparse: number[] = [];
    timeIt(() => {
      for (let i = 0; i < size * 100; i += 100) {
        sparse[i] = 0;
      }
    });

    console.log("Dense array push");
    const dense1: number[] = [];
    timeIt(() => {
      for (let i = 0; i < size * 100; i += 100) {
        dense1.push(i);
      }
    });

    console.log("Dense array set");
    const dense2: number[] = [];
    timeIt(() => {
      for (let i = 0; i < size; i++) {
        dense2[i] = i;
      }
    });

    console.log("Map");
    const map = new Map<number, number>();
    timeIt(() => {
      for (let i = 0; i < size * 100; i += 100) {
        map.set(i, i);
      }
    });

    console.log("Object");
    const obj: { [key: number]: number } = {};
    timeIt(() => {
      for (let i = 0; i < size * 100; i += 100) {
        obj[i] = i;
      }
    });
  });

  it.skip("measure time to iterate through regular array with 10 million entries", () => {
    console.log("Regular array:");
    timeIt(() => {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += i;
      }
      console.log("Sum", sum);
    });

    console.log("Regular array iterator:");
    timeIt(() => {
      let sum = 0;
      for (const i of array) {
        sum += i;
      }
      console.log("Sum", sum);
    });

    console.log("Typed array:");
    timeIt(() => {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        sum += typedArray[i];
      }
      console.log("Sum", sum);
    });

    console.log("Typed array iterator:");
    timeIt(() => {
      let sum = 0;
      for (const i of typedArray) {
        sum += i;
      }
      console.log("Sum", sum);
    });
  });
});
