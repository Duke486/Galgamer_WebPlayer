export function createInitialRuntimeState(meta = {}) {
  return {
    started: false,
    finished: false,
    pointer: 0,
    background: meta.initialBackground || 'poster.png',
    video: null,
    voice: null,
    currentNode: null,
    currentChoice: null,
  }
}

export function cloneRuntimeState(state) {
  return JSON.parse(JSON.stringify(state))
}
