import { makeAutoObservable, reaction } from "mobx";

/**
 * A static time class that allows us to play time in the speed we want to.
 * Using this instead of setTimeout allows us to synchronize the system loops with the phaser time
 * (eg. don't run the strolling system when the window is inactive) and simplifies testing systems as we
 * have control over the time.
 */
export class Time {
  private static instance: Time;
  private nonce = 0;
  timestamp = 0;

  constructor() {
    makeAutoObservable(this);
  }

  public static get time(): Time {
    if (!this.instance) this.instance = new Time();
    return this.instance;
  }

  /**
   * Sets the internal timestamp to the given number.
   * Use with caution, should not be called directly in most cases.
   * Use setPacemaker instead.
   * @param timestamp
   */
  public setTimestamp(timestamp: number) {
    this.timestamp = timestamp;
  }

  /**
   * Allows to register a function that sets the current timestamp in regular intervals.
   * Makes sure only the last call to setPacemaker actually sets the time.
   * @param pacemaker Callback with a reference to setTimestamp
   */
  public setPacemaker(pacemaker: (setTimestamp: (timestamp: number) => void) => void) {
    this.nonce++;
    const currentNonce = this.nonce;
    pacemaker((timestamp: number) => {
      // Only the most recent pacemaker actually sets the timestamp
      if (this.nonce === currentNonce) this.setTimestamp(timestamp);
    });
  }

  /**
   * Use as a replacement of the native setTimeout
   * @param callback Callback to be called after delay
   * @param delay Delay after which to call thecallback
   * @returns
   */
  public setTimeout(callback: () => unknown, delay: number) {
    if (delay === 0) return callback();

    const dueTime = this.timestamp + delay;
    const dispose = reaction(
      () => this.timestamp,
      (currentTime) => {
        if (currentTime >= dueTime) {
          // Calling the callback in a setTimeout makes it be executed in the next event loop,
          // so exactly the same behavior as when calling the native setTimeout
          setTimeout(callback);
          dispose();
        }
      }
    );
  }

  /**
   * Use as a replacement of the native setInterval
   * @param callback Callback to be called once in every interval
   * @param interval Interval in which to call the callback
   * @returns Disposer to stop the interval
   */
  public setInterval(callback: () => unknown, interval: number) {
    if (interval === 0) throw new Error("Interval must be greater than 0");

    let lastInvocation = this.timestamp;

    const dispose = reaction(
      () => this.timestamp,
      (currentTime) => {
        if (currentTime >= lastInvocation + interval) {
          // Calling the callback in a setTimeout makes it be executed in the next event loop,
          // so exactly the same behavior as when calling the native setInterval
          setTimeout(callback);
          lastInvocation = currentTime;
        }
      }
    );

    return dispose;
  }
}
