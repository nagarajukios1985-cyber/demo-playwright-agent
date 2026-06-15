const memoryStore = {
  failures: [],
  successes: [],
  toolHistory: []
};

export function addFailure(entry) {
  memoryStore.failures.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
}

export function addSuccess(entry) {
  memoryStore.successes.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
}

export function addToolHistory(entry) {
  memoryStore.toolHistory.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
}

export function getMemory() {
  return memoryStore;
}