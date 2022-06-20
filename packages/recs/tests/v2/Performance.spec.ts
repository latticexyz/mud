import { defineComponent, withValue } from "../../src/Component";
import { defineComponent as defineComponentV2, withValue as withValueV2 } from "../../src/v2/Component";
import { createWorld } from "../../src/World";
import { createWorld as createWorldV2 } from "../../src/v2/World";
import { createEntity } from "../../src/Entity";
import { createEntity as createEntityV2 } from "../../src/v2/Entity";
import { Type } from "../../src/constants";
import { defineUpdateQuery, Has } from "../../src/Query";
import { defineUpdateQuery as defineUpdateQueryV2 } from "../../src/v2/Query";
import { defineReactionSystem } from "../../src/System";

export function timeIt(fn: () => unknown) {
  const start = Date.now();
  fn();
  const end = Date.now();
  const duration = end - start;
  console.log("Duration:", duration);
  return duration;
}

describe("V1 vs V2", () => {
  const size = 10000;
  it.only("measure creation of 10000 entities", () => {
    console.log("V1");
    timeIt(() => {
      const world = createWorld();
      const Position = defineComponent(world, { x: Type.Number, y: Type.Number });
      const query = defineUpdateQuery(world, [Has(Position)]);

      defineReactionSystem(
        world,
        () => query.get(),
        (data) => {
          const entities = data;
        }
      );

      for (let i = 0; i < size; i++) {
        createEntity(world, [withValue(Position, { x: 1, y: 1 })]);
      }
    });

    console.log("V2");
    timeIt(() => {
      const world = createWorldV2();
      const Position = defineComponentV2({ x: Type.Number, y: Type.Number });
      const query$ = defineUpdateQueryV2([Position]);

      query$.subscribe((e) => {
        const entities = e;
      });

      for (let i = 0; i < size; i++) {
        createEntityV2(world, [[Position, { x: 1, y: 1 }]]);
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
    const randomOtherArr = [];
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
