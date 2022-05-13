import { filter, map, Observable, ReplaySubject, withLatestFrom } from "rxjs";

export interface ClockConfig {
  period: number;
  initialValue: number;
}

export type Clock = {
  time$: Observable<number>;
  fresh$: Observable<boolean>;
  lastFreshTime$: Observable<number>;
  tick: (time: number, maintainStale?: boolean) => void;
  dispose: () => void;
};

export function createClock(config: ClockConfig): Clock {
  const { initialValue, period } = config;

  let currentTime: number = initialValue;
  let intervalId: ReturnType<typeof setInterval>;

  const time$ = new ReplaySubject<number>(1);
  const fresh$ = new ReplaySubject<boolean>(1);

  const emit = () => time$.next(currentTime);
  const fresh = () => fresh$.next(true);
  const stale = () => fresh$.next(false);

  emit();

  const createTickinInterval = () =>
    setInterval(() => {
      currentTime += period;
      emit();
      stale();
    }, period);

  const tick = (time: number, maintainStale?: boolean) => {
    clearInterval(intervalId);
    currentTime = time;
    emit();
    if (maintainStale) {
      stale();
    } else {
      fresh();
    }
    intervalId = createTickinInterval();
  };

  intervalId = createTickinInterval();

  return {
    time$: time$.asObservable(),
    fresh$: fresh$.asObservable(),
    lastFreshTime$: fresh$.pipe(
      filter((fresh) => fresh),
      withLatestFrom(time$),
      map(([, time]) => time)
    ),
    tick,
    dispose: () => clearInterval(intervalId),
  };
}
