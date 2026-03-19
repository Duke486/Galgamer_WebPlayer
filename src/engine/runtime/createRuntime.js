import { cloneRuntimeState, createInitialRuntimeState } from './runtimeState'

export function createRuntime(scenario) {
  const state = createInitialRuntimeState(scenario.meta)
  const nodes = scenario.nodes || []

  function getNode(pointer = state.pointer) {
    return nodes[pointer] || null
  }

  function applyLineNode(node) {
    state.video = null
    if (node.visual) state.background = node.visual
    state.voice = node.voice || null
    state.currentChoice = null
    state.currentNode = node
    state.pointer += 1
    return snapshot()
  }

  function applyVideoNode(node) {
    state.video = node.visual || null
    state.voice = null
    state.currentChoice = null
    state.currentNode = node
    state.pointer += 1
    return snapshot()
  }

  function applyChoiceNode(node) {
    state.video = null
    if (node.visual) state.background = node.visual
    state.voice = node.voice || null
    state.currentNode = node
    state.currentChoice = {
      question: node.text,
      options: node.options || [],
    }
    state.pointer += 1
    return snapshot()
  }

  function advance() {
    if (!state.started) {
      state.started = true
    }

    if (state.finished) {
      return snapshot()
    }

    while (true) {
      const node = getNode()
      if (!node) {
        state.finished = true
        return snapshot()
      }

      if (node.type === 'jump') {
        state.pointer = node.target
        continue
      }

      if (node.type === 'video') {
        return applyVideoNode(node)
      }

      if (node.type === 'choice') {
        return applyChoiceNode(node)
      }

      return applyLineNode(node)
    }
  }

  function choose(target) {
    state.pointer = target
    state.currentChoice = null
    return advance()
  }

  function restart() {
    const fresh = createInitialRuntimeState(scenario.meta)
    Object.assign(state, fresh)
    return snapshot()
  }

  function snapshot() {
    return cloneRuntimeState(state)
  }

  return {
    advance,
    choose,
    restart,
    snapshot,
  }
}
