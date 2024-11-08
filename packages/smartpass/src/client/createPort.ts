export function createPort({ bridge, origin, signal }: { bridge: Window; origin: string; signal?: AbortSignal }) {
  return new Promise<MessagePort>((resolve, reject) => {
    const timer = setInterval(() => {
      const channel = new MessageChannel();
      channel.port1.addEventListener("message", (event) => {
        if (event.data === "bridge:connected") {
          clearInterval(timer);
          resolve(channel.port1);
          // TODO: remove event listener?
        }
      });
      channel.port1.start();
      bridge.postMessage("bridge:connect", origin, [channel.port2]);
    }, 50);

    if (signal?.aborted) {
      reject(signal?.reason);
    }

    signal?.addEventListener(
      "abort",
      () => {
        clearInterval(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
