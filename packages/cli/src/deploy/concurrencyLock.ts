export class ConcurrencyLock {
  private readonly concurrency: number;
  private readonly interval: number;

  private running = 0;
  private waitingResolves: Array<() => void> = [];
  private lastRunAt: Date | null = null;

  constructor({ concurrency, interval }: { concurrency?: number; interval?: number }) {
    this.concurrency = concurrency ?? 1000;
    this.interval = interval ?? 0;
  }

  async run<T>(func: () => PromiseLike<T> | T): Promise<T> {
    await this.get(new Date());
    const result = await func();
    await this.release(new Date());

    return result;
  }

  private async get(calledAt: Date) {
    await new Promise<void>((resolve) => {
      if (this.running >= this.concurrency) {
        this.waitingResolves.push(resolve);
        return;
      }

      this.running += 1;
      this.schedule(resolve, calledAt);
    });
  }

  private async release(calledAt: Date) {
    if (this.running === 0) {
      console.warn("ConcurrencyLock#release was called but has no runnings");
      return;
    }

    if (this.waitingResolves.length === 0) {
      this.running -= 1;
      return;
    }

    const popped = this.waitingResolves.shift();
    if (!popped) {
      return;
    }
    this.schedule(popped, calledAt);
  }

  private schedule(func: () => void, calledAt: Date) {
    const willRunAt = !this.lastRunAt
      ? calledAt
      : new Date(Math.max(calledAt.getTime(), this.lastRunAt.getTime() + this.interval));

    this.lastRunAt = willRunAt;

    setTimeout(func, willRunAt.getTime() - calledAt.getTime());
  }
}
