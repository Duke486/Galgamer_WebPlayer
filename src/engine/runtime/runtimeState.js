export function createInitialRuntimeState(meta = {}, initialVariables = {}) {
  return {
    started: false,
    finished: false,
    pointer: 0,
    background: meta.initialBackground || 'poster.png',
    video: null,
    voice: null,
    bgm: meta.initialBgm || null,
    currentCommand: null,
    currentChoice: null,
    variables: { ...initialVariables },
    history: [],
  }
}

export function cloneRuntimeState(state) {
  return JSON.parse(JSON.stringify(state))
}
