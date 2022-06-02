import { ReplaySubject } from "rxjs";
import { Clock, ClockConfig } from "./types";

export function createClock(config: ClockConfig): Clock {
  const { initialTime, period } = config;

  const clock = {
    currentTime: initialTime,
    lastUpdateTime: initialTime,
    time$: new ReplaySubject<number>(1),
    dispose: () => clearInterval(intervalId),
    update,
  };

  let intervalId = createTickInterval();
  emit();

  function emit() {
    clock.time$.next(clock.currentTime);
  }

  function createTickInterval() {
    return setInterval(() => {
      clock.currentTime += period;
      emit();
    }, period);
  }

  function update(time: number) {
    clearInterval(intervalId);
    clock.currentTime = time;
    clock.lastUpdateTime = time;
    emit();
    intervalId = createTickInterval();
  }

  return clock;
}
