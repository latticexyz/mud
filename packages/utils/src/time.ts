/**
 * Create an auto resetting value.
 *
 * @param defaultValue Value to return to `timeUntilReset` miliseconds after a new value was set
 * @param timeUntilReset Miliseconds to wait until returning to the default value
 * @returns `{ value: variable returning to default value after `timeUntilReset` miliseconds, setValue: function to temporarity set the value }`
 */
export function createAutoResettingValue<T>(defaultValue: T, timeUntilReset: number) {
  let timeout = setTimeout(() => void 0);

  const state = {
    value: defaultValue,
    setValue: (v: T) => {
      clearTimeout(timeout);
      state.value = v;
      timeout = setTimeout(() => (state.value = defaultValue), timeUntilReset);
    },
  };

  return state;
}
