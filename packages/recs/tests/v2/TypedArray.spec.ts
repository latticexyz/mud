import { defineComponent } from "../../v2/Component";

export function timeIt(fn: () => unknown) {
  const start = Date.now();
  fn();
  const end = Date.now();
  const duration = end - start;
  console.log("Duration:", duration);
  return duration;
}

describe("TypedArray", () => {
  let array: number[];
  let typedArray: Uint32Array;
  const size = 100000000;

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

  it("measure time to iterate through regular array with 1 million entries", () => {
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
