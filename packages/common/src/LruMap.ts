/**
 * Map with a LRU (least recently used) policy.
 *
 * @link https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU
 * @link https://github.com/wevm/viem/blob/0fa08e113a890e6672fdc64fa7a2206a840611ab/src/utils/lru.ts
 */
export class LruMap<key, value> extends Map<key, value> {
  maxSize: number;

  constructor(size: number) {
    super();
    this.maxSize = size;
  }

  override get(key: key): value | undefined {
    const value = super.get(key);
    if (this.has(key)) {
      this.delete(key);
      this.set(key, value as never);
    }
    return value;
  }

  override set(key: key, value: value): this {
    super.set(key, value);
    if (this.maxSize && this.size > this.maxSize) {
      this.delete(this.keys().next().value);
    }
    return this;
  }
}
