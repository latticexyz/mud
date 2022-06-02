import { Clock } from "../src/new/types";
import { createClock } from "../src/new/createClock";

describe("Clock", () => {
  let clock: Clock;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    clock = createClock({ period: 1000, initialTime: 0 });
  });

  it("should emit a value every period", () => {
    //
    const mock = jest.fn();
    clock.time$.subscribe((time) => {
      mock(time);
    });
    jest.advanceTimersByTime(5000);
    expect(mock).toHaveBeenCalledTimes(6);
    expect(mock).toHaveBeenNthCalledWith(1, 0);
    expect(mock).toHaveBeenNthCalledWith(2, 1000);
    expect(mock).toHaveBeenNthCalledWith(3, 2000);
    expect(mock).toHaveBeenNthCalledWith(4, 3000);
    expect(mock).toHaveBeenNthCalledWith(5, 4000);
    expect(mock).toHaveBeenNthCalledWith(6, 5000);
    expect(clock.currentTime).toBe(5000);
  });

  it("should start a new interval if the clock is ticked externally", () => {
    //
    const mock = jest.fn();
    clock.time$.subscribe((time) => {
      mock(time);
    });

    jest.advanceTimersByTime(2500);

    // Before updating the lastFreshTime should be 0
    expect(clock.lastUpdateTime).toBe(0);

    // Externally setting the time
    clock.update(10000);

    jest.advanceTimersByTime(2500);

    expect(mock).toHaveBeenCalledTimes(6);

    // First three calls from initial interval
    expect(mock).toHaveBeenNthCalledWith(1, 0);
    expect(mock).toHaveBeenNthCalledWith(2, 1000);
    expect(mock).toHaveBeenNthCalledWith(3, 2000);

    // One call from setting the new time
    expect(mock).toHaveBeenNthCalledWith(4, 10000);

    // Two more calls from the second interval
    expect(mock).toHaveBeenNthCalledWith(5, 11000);
    expect(mock).toHaveBeenNthCalledWith(6, 12000);

    expect(clock.lastUpdateTime).toBe(10000);
    expect(clock.currentTime).toBe(12000);
  });
});
