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

  override set(key: key, value: value): this {
    super.set(key, value);
    if (this.maxSize && this.size > this.maxSize) {
      this.delete(this.keys().next().value);
    }
    return this;
  }
}
