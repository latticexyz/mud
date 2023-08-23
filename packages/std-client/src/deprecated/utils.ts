import { Component, Schema, ComponentValue, componentValueEquals, Metadata, Entity } from "@latticexyz/recs";
import { keccak256, deferred } from "@latticexyz/utils";
import { filter } from "rxjs";

/**
 * Generate a random color based on the given id.
 * @param id Any string
 * @returns A color in the range 0x000000 - 0xFFFFFF
 */
export function randomColor(id: string): number {
  const randSeed = new Array(4); // Xorshift: [x, y, z, w] 32 bit values
  function seedRand(seed: string) {
    for (let i = 0; i < randSeed.length; i++) {
      randSeed[i] = 0;
    }
    for (let i = 0; i < seed.length; i++) {
      randSeed[i % 4] = (randSeed[i % 4] << 5) - randSeed[i % 4] + seed.charCodeAt(i);
    }
  }

  function rand() {
    const t = randSeed[0] ^ (randSeed[0] << 11);
    randSeed[0] = randSeed[1];
    randSeed[1] = randSeed[2];
    randSeed[2] = randSeed[3];
    randSeed[3] = randSeed[3] ^ (randSeed[3] >> 19) ^ t ^ (t >> 8);
    return (randSeed[3] >>> 0) / ((1 << 31) >>> 0);
  }

  function createColor(): [number, number, number] {
    // hue is the whole color spectrum
    const h = Math.floor(rand() * 360) / 360;
    //saturation goes from 40 to 100, it avoids greyish colors
    // --> Multiply by 0.75 to limit saturation
    // const s = ((rand() * 60 + 40) / 100) * 0.75;
    const s = 80 / 100;
    // lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
    // --> Multiply by 0.65 to shift
    // const l = (((rand() + rand() + rand() + rand()) * 25) / 100) * 0.65;
    const l = 70 / 100;
    return [h, s, l];
  }

  function RgbToHex(red: number, green: number, blue: number): number {
    return (red << 16) | (green << 8) | blue;
  }

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
  }

  seedRand(id);

  return RgbToHex(...HSLToRGB(...createColor()));
}

export function getStringColor(address: string) {
  return randomColor(keccak256(address).substring(2));
}
