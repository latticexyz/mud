const TOPICS_KEY = "mud-logger-topics";

export function enableLogger() {
  const windowConsole = window.console;
  let filtersActive = Boolean(localStorage.getItem(TOPICS_KEY));

  const topicsString = localStorage.getItem(TOPICS_KEY);
  let topics: string[] = topicsString ? JSON.parse(topicsString) : [];

  function log(...logs: string[]) {
    if (filtersActive) return;
    windowConsole.log(...logs);
  }

  function logWithTopic(topic: string, ...logs: string[]) {
    if (!filtersActive || topics.includes(topic)) {
      windowConsole.log(`--- BETTER CONSOLE / TOPIC ${topic} ---`);
      windowConsole.log(...logs);
    }
  }

  function enableFilters() {
    localStorage.setItem(TOPICS_KEY, JSON.stringify([]));
    filtersActive = true;
  }

  function disableFilters() {
    localStorage.removeItem(TOPICS_KEY);
    filtersActive = false;
  }

  function addTopic(topic: string) {
    topics.push(topic);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }

  function removeTopic(topic: string) {
    topics = topics.filter((t) => t !== topic);
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }

  function resetTopics() {
    topics = [];
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }

  const logger = {
    ...windowConsole,
    log,
    logWithTopic,
    enableFilters,
    disableFilters,
    addTopic,
    removeTopic,
    resetTopics,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).logger = logger;
  window.console = logger;
  return logger;
}
