import { cloneRuntimeState, createInitialRuntimeState } from './runtimeState'

function isLabelReference(target) {
  return typeof target === 'string' && target.trim().length > 0
}

function resolveTarget(target, labels) {
  if (typeof target === 'number') return target
  if (isLabelReference(target)) return labels[target] ?? null
  return null
}

export function createRuntime(scenario) {
  const commands = scenario.commands || []
  const labels = scenario.labels || {}
  const initialState = createInitialRuntimeState(scenario.meta, scenario.initialVariables)
  const state = cloneRuntimeState(initialState)

  function snapshot() {
    return cloneRuntimeState(state)
  }

  function getCommand(pointer = state.pointer) {
    return commands[pointer] || null
  }

  function pushHistory(command, beforeState) {
    if (!command) return
    if (command.type !== 'line' && command.type !== 'choice') return

    state.history.push({
      id: command.id,
      commandIndex: command.index,
      type: command.type,
      speaker: command.speaker || '',
      text: command.text || '',
      voice: command.voice || '',
      visual: command.visual || '',
      restorePoint: cloneRuntimeState(beforeState),
    })
  }

  function applyPresentationCommand(command) {
    const beforeState = snapshot()
    state.video = null
    if (command.visual) state.background = command.visual
    state.voice = command.voice || null
    state.currentChoice = null
    state.currentCommand = command
    pushHistory(command, beforeState)
    state.pointer += 1
    return snapshot()
  }

  function applyVideoCommand(command) {
    state.video = command.visual || null
    state.voice = null
    state.currentChoice = null
    state.currentCommand = command
    state.pointer += 1
    return snapshot()
  }

  function applyChoiceCommand(command) {
    const beforeState = snapshot()
    state.video = null
    if (command.visual) state.background = command.visual
    state.voice = command.voice || null
    state.currentCommand = command
    state.currentChoice = {
      question: command.text,
      options: command.options || [],
    }
    pushHistory(command, beforeState)
    state.pointer += 1
    return snapshot()
  }

  function applySetCommand(command) {
    state.variables[command.name] = command.value
    state.pointer += 1
  }

  function evaluateCondition(condition) {
    if (!condition) return false
    const left = state.variables[condition.var]
    const right = condition.value

    switch (condition.op) {
      case '===':
      case '==':
        return left === right
      case '!==':
      case '!=':
        return left !== right
      case '>':
        return left > right
      case '>=':
        return left >= right
      case '<':
        return left < right
      case '<=':
        return left <= right
      case 'truthy':
        return Boolean(left)
      case 'falsy':
        return !left
      default:
        return false
    }
  }

  function applyJumpCommand(command) {
    const target = resolveTarget(command.target, labels)
    if (typeof target !== 'number') {
      throw new Error(`Invalid jump target: ${command.target}`)
    }
    state.pointer = target
  }

  function applyConditionalJump(command) {
    if (evaluateCondition(command.condition)) {
      applyJumpCommand(command)
      return
    }
    state.pointer += 1
  }

  function applyBgmCommand(command) {
    state.bgm = command.audio || null
    state.pointer += 1
  }

  function advance() {
    if (!state.started) {
      state.started = true
    }

    if (state.finished) {
      return snapshot()
    }

    while (true) {
      const command = getCommand()
      if (!command) {
        state.finished = true
        return snapshot()
      }

      switch (command.type) {
        case 'label':
          state.pointer += 1
          continue
        case 'set':
          applySetCommand(command)
          continue
        case 'jump':
          applyJumpCommand(command)
          continue
        case 'jumpIf':
          applyConditionalJump(command)
          continue
        case 'bgm':
          applyBgmCommand(command)
          continue
        case 'video':
          return applyVideoCommand(command)
        case 'choice':
          return applyChoiceCommand(command)
        case 'line':
        default:
          return applyPresentationCommand(command)
      }
    }
  }

  function choose(target, effects = []) {
    for (const effect of effects) {
      if (effect?.type === 'set' && effect.name) {
        state.variables[effect.name] = effect.value
      }
    }

    state.pointer = target
    state.currentChoice = null
    return advance()
  }

  function restore(nextState) {
    const fresh = createInitialRuntimeState(scenario.meta, scenario.initialVariables)
    Object.assign(fresh, cloneRuntimeState(nextState))
    Object.assign(state, fresh)
    return snapshot()
  }

  function jumpToHistory(restorePoint) {
    const base = restore(restorePoint)
    if (!base.started) {
      state.started = true
    }
    return advance()
  }

  function restart() {
    return restore(initialState)
  }

  return {
    advance,
    choose,
    restart,
    restore,
    jumpToHistory,
    snapshot,
  }
}
