export function makeIterable<T>(iterator: Iterator<T>): IterableIterator<T> {
  const iterable: IterableIterator<T> = {
    ...iterator,
    [Symbol.iterator]() {
      return this;
    },
  };

  return iterable;
}

export function concatIterators<T>(first: Iterator<T>, second?: Iterator<T>): IterableIterator<T> {
  if (!second) return makeIterable(first);
  return makeIterable({
    next() {
      const next = first.next();
      if (!next.done) return next;
      return second.next();
    },
  });
}

export function mergeIterators<A, B>(iteratorA: Iterator<A>, iteratorB: Iterator<B>): IterableIterator<[A, B]> {
  const iterator: Iterator<[A, B]> = {
    next() {
      const nextA = iteratorA.next();
      const nextB = iteratorB.next();
      if (nextA.done && nextB.done) return { done: true, value: null };
      return { value: [nextA.value, nextB.value] };
    },
  };
  return makeIterable(iterator);
}

export function transformIterator<A, B>(iterator: Iterator<A>, transform: (value: A) => B): IterableIterator<B> {
  return makeIterable({
    next() {
      const { done, value } = iterator.next();
      return { done, value: done ? value : transform(value) };
    },
  });
}

/**
 * Turns an array into an iterator. NOTE: an iterator can only be iterated once.
 * @param array Array to be turned into an iterator
 * @returns Iterator to iterate through the array
 */
export function arrayToIterator<T>(array: T[]): IterableIterator<T> {
  let i = 0;
  const iterator: Iterator<T> = {
    next() {
      const done = i >= array.length;
      if (done) return { done, value: null };
      return { value: array[i++] };
    },
  };
  return makeIterable(iterator);
}
