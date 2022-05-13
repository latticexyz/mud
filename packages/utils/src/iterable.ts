export function makeIterable<T>(iterator: Iterator<T>): IterableIterator<T> {
  const iterable: IterableIterator<T> = {
    ...iterator,
    [Symbol.iterator]() {
      return this;
    },
  };

  return iterable;
}

export function mergeIterators<T>(first: Iterator<T>, second?: Iterator<T>): IterableIterator<T> {
  if (!second) return makeIterable(first);
  return makeIterable({
    next() {
      const next = first.next();
      if (!next.done) return next;
      return second.next();
    },
  });
}

export function transformIterator<A, B>(iterator: Iterator<A>, transform: (value: A) => B): IterableIterator<B> {
  return makeIterable({
    next() {
      const next = iterator.next();
      return {
        done: next.done,
        value: transform(next.value),
      };
    },
  });
}
