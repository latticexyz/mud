import { makeAutoObservable } from "mobx";
import { mergeIterators } from "@mudkit/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSuperSet(s: any): s is SuperSet<any> {
  return s[Symbol.toStringTag] === "SuperSetMap";
}

export class SuperSet<T> implements Set<T> {
  parent?: SuperSet<T>;
  child: Set<T>;

  constructor(options?: { values?: T[]; parent?: SuperSet<T>; child?: Set<T> }) {
    this.child = options?.child || new Set<T>(options?.values);
    this.parent = options?.parent;

    makeAutoObservable(this);
  }

  [Symbol.iterator]() {
    return this.values();
  }

  get [Symbol.toStringTag]() {
    return "SuperSet";
  }

  get size(): number {
    return this.child.size + (this.parent?.size || 0);
  }

  add(value: T): this {
    if (!this.parent || !this.parent.has(value)) {
      this.child.add(value);
    }
    return this;
  }

  clear(): void {
    this.child.clear();
  }

  delete(value: T): boolean {
    return this.child.delete(value);
  }

  entries(): IterableIterator<[T, T]> {
    return mergeIterators(this.child.entries(), this.parent?.entries());
  }

  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void {
    this.child.forEach(callbackfn, thisArg);
    this.parent?.forEach(callbackfn, thisArg);
  }

  has(value: T): boolean {
    return this.parent?.has(value) || this.child.has(value);
  }

  keys(): IterableIterator<T> {
    return mergeIterators(this.child.keys(), this.parent?.keys());
  }

  values(): IterableIterator<T> {
    return mergeIterators(this.child.values(), this.parent?.values());
  }

  flat(): Set<T> {
    return new Set<T>([...this]);
  }
}
