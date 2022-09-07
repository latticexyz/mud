/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * src/wasm/assembly/index/smoothStep
 * @param x `i64`
 * @param scale `i32`
 * @returns `f64`
 */
export declare function smoothStep(x: bigint, scale: number): number;
/**
 * src/wasm/assembly/index/perlinSingle
 * @param x `i32`
 * @param y `i32`
 * @param seed `i32`
 * @param scale `i32`
 * @param floor `bool`
 * @returns `f64`
 */
export declare function perlinSingle(x: number, y: number, seed: number, scale: number, floor: boolean): number;
/**
 * src/wasm/assembly/index/perlinRect
 * @param x0 `i32`
 * @param y0 `i32`
 * @param w `i32`
 * @param h `i32`
 * @param seed `i32`
 * @param scale `i32`
 * @param floor `bool`
 * @returns `~lib/staticarray/StaticArray<f64>`
 */
export declare function perlinRect(
  x0: number,
  y0: number,
  w: number,
  h: number,
  seed: number,
  scale: number,
  floor: boolean
): ArrayLike<number>;
/**
 * src/wasm/assembly/perlin2/noise2d
 * @param x `i64`
 * @param y `i64`
 * @returns `i64`
 */
export declare function noise2d(x: bigint, y: bigint): bigint;
