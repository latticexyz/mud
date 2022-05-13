import { runInAction } from "mobx";
import { computed, observable } from "mobx";
import { deferred } from "./deferred";
import { cacheUntilReady } from "./proxy";

describe("cacheUntilReady", () => {
  describe("property access", () => {
    it("should immediately relay simple property access to the computed target if it is ready", () => {
      const target = computed(() => ({ a: 1 }));
      const proxy = cacheUntilReady(target);
      expect(proxy.a).toBe(1);
      expect(proxy.proxied).toBe(false);
    });

    it("should immediately relay simple property access to the observable target if it is ready", () => {
      const target = observable.box({ a: 1 });
      const proxy = cacheUntilReady(target);
      expect(proxy.a).toBe(1);
      expect(proxy.proxied).toBe(false);
    });

    it("should immediately relay deep property access to the computed target if it is ready", () => {
      const target = computed(() => ({ a: { b: { c: 2 } } }));
      const proxy = cacheUntilReady(target);
      expect(proxy.a.b.c).toBe(2);
      expect(proxy.proxied).toBe(false);
    });

    it("should immediately relay deep property access to the observable target if it is ready", () => {
      const target = observable.box({ a: { b: 2 } });
      const proxy = cacheUntilReady(target);
      expect(proxy.a.b).toBe(2);
      expect(proxy.proxied).toBe(false);
    });

    it("should return undefined for property access if the target is not ready", () => {
      const target = observable.box<{ a: { b: number } } | undefined>(undefined);
      const proxy = cacheUntilReady(target);
      const result1 = proxy.a;
      const result2 = proxy.a.b;

      expect(JSON.stringify(result1)).toBe(JSON.stringify({ proxied: true }));
      expect(JSON.stringify(result2)).toBe(JSON.stringify({ proxied: true }));
      expect(proxy.proxied).toBe(true);
    });
  });

  describe("function calls", () => {
    it("should immediately relay top level function calls to the computed target it if it ready", () => {
      const target = computed(() => ({
        a: () => 1,
      }));

      const proxy = cacheUntilReady(target);

      expect(proxy.a()).toBe(1);
    });

    it("should immediately relay top level function calls to the observable target it if it ready", () => {
      const target = observable.box({
        a: () => 1,
      });

      const proxy = cacheUntilReady(target);

      expect(proxy.a()).toBe(1);
    });

    it("should immediately relay deep nested function calls to the computed target it if it ready", () => {
      const target = computed(() => ({
        a: { b: () => 1 },
      }));

      const proxy = cacheUntilReady(target);

      expect(proxy.a.b()).toBe(1);
    });

    it("should immediately relay deep nested function calls to the observable target it if it ready", () => {
      const target = observable.box({
        a: { b: () => 1 },
      });

      const proxy = cacheUntilReady(target);

      expect(proxy.a.b()).toBe(1);
    });

    it("should chache top level function calls to the target until it is ready", async () => {
      const target = observable.box<{ a: (n: number) => number } | undefined>(undefined);

      const proxy = cacheUntilReady(target);

      // Target is not ready yet, but function is called already
      const result1 = proxy.a(1);
      const result2 = proxy.a(2);

      // Now target is ready
      runInAction(() => target.set({ a: (n) => n }));

      // Cached function calls are applied,
      expect(await result1).toEqual(1);
      expect(await result2).toEqual(2);
    });

    it("should chache nested function calls to the target until it is ready", async () => {
      const target = observable.box<{ a: { b: (n: number) => number } } | undefined>(undefined);

      const proxy = cacheUntilReady(target);

      // Target is not ready yet, but function is called already
      const result1 = proxy.a.b(1);
      const result2 = proxy.a.b(2);

      const getResult3 = async () => proxy.a.b((await result1) + (await result2));
      const result3 = getResult3();

      // Now target is ready
      runInAction(() => target.set({ a: { b: (n) => n + 1 } }));

      // Cached function calls are applied,
      expect(await result1).toEqual(2);
      expect(await result2).toEqual(3);
      expect(await result3).toEqual(6);
    });

    it("should chache nested function calls without parameters to the target until it is ready", async () => {
      const target = observable.box<{ a: { b: () => number } } | undefined>(undefined);

      const proxy = cacheUntilReady(target);

      // Target is not ready yet, but function is called already
      const result1 = proxy.a.b();
      const result2 = proxy.proxied && proxy.a.b();

      // Now target is ready
      runInAction(() => target.set({ a: { b: () => 1 } }));

      // Cached function calls are applied,
      expect(await result1).toEqual(1);
      expect(await result2).toEqual(1);
    });

    it("should chache nested function calls with variable parameters to the target until it is ready", async () => {
      const target = observable.box<{ a: { b: (...args: number[]) => number } } | undefined>(undefined);

      const proxy = cacheUntilReady(target);

      // Target is not ready yet, but function is called already
      const result1 = proxy.a.b();
      const result2 = proxy.a.b(1);
      const result3 = proxy.a.b(1, 2);
      const result4 = proxy.a.b(1, 2, 3);

      // Now target is ready
      runInAction(() => target.set({ a: { b: (...args) => args.reduce((acc, curr) => acc + curr, 0) } }));

      // Cached function calls are applied,
      expect(await result1).toEqual(0);
      expect(await result2).toEqual(1);
      expect(await result3).toEqual(3);
      expect(await result4).toEqual(6);
    });

    it("should return a non-nested proxy if the called target function returns a proxy", async () => {
      const target = observable.box<{ a: { b: () => Promise<number> } } | undefined>(undefined);

      const proxy = cacheUntilReady(target);

      // Target is not ready yet, but function is called already
      const result1 = proxy.a.b();
      const result2 = proxy.a.b();

      const [resolve, , promise] = deferred<number>();
      // Now target is ready
      runInAction(() => target.set({ a: { b: () => promise } }));

      // Now resolve the promise returned by the target function
      resolve(1);

      // Cached function calls are applied,
      expect(await result1).toEqual(1);
      expect(await result2).toEqual(1);
    });
  });
});
