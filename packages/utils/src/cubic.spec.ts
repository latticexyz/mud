import { cubicNoiseSample2, cubicNoiseConfig } from "./cubic";

describe("Cubic", () => {
  it("computes noise", () => {
    const coords: [number, number][] = [];
    for (let i = 0; i < 100; i++) {
      coords.push([Math.floor((Math.random() - 0.5) * 1000), Math.floor((Math.random() - 0.5) * 1000)]);
    }

    const noises = coords.map((c) => cubicNoiseSample2(cubicNoiseConfig(1000, 64, 16, 256, 256), c[0], c[1]));
    console.log("coords", JSON.stringify(coords));
    console.log("noises", JSON.stringify(noises));
  });
});
