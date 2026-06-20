const memoryStore = {
  failures: [],
  successes: [],
  toolHistory: [],
  reflections: []
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

export function addReflection(item) {
  memoryStore.reflections.push({
    ...item,
    timestamp:
      new Date().toISOString()
  });
}