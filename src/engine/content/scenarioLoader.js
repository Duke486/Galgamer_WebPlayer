import rawScenario from '@/assets/game1.json'

function inferLegacyNodeType(node) {
  if (node.character === 'vid') return 'video'
  if (node.character === 'jump') return 'jump'
  if (node.character === 'choose') return 'choice'
  return 'line'
}

function normalizeLegacyScenario(raw) {
  const choicesByQuestion = new Map(
    (raw.choices || []).map((choice) => [choice.question, choice]),
  )

  const commands = (raw.plot || []).map((node, index) => {
    const type = inferLegacyNodeType(node)
    const baseCommand = {
      id: `legacy-${index}`,
      index,
      type,
      speaker: node.character || '',
      text: node.say || '',
      visual: node.vision || '',
      voice: node.voice || '',
    }

    if (type === 'choice') {
      const choice = choicesByQuestion.get(node.say)
      return {
        ...baseCommand,
        options: choice
          ? [
              { key: 'A', label: choice.A, target: choice.indexA },
              { key: 'B', label: choice.B, target: choice.indexB },
            ]
          : [],
      }
    }

    if (type === 'jump') {
      return {
        ...baseCommand,
        target: Number.parseInt(node.say, 10),
      }
    }

    return baseCommand
  })

  return {
    meta: {
      title: 'Galgamer WebPlayer Demo',
      initialBackground: 'poster.png',
      initialVideo: 'M1.mp4',
      initialBgm: null,
      version: 'legacy-demo',
    },
    commands,
    labels: {},
    initialVariables: {},
  }
}

function normalizeModernScenario(raw) {
  const commands = (raw.commands || []).map((command, index) => ({
    id: command.id || `cmd-${index}`,
    index,
    ...command,
  }))

  const labels = {}
  commands.forEach((command, index) => {
    if (command.type === 'label' && command.name) {
      labels[command.name] = index
    }
  })

  return {
    meta: {
      title: raw.meta?.title || 'Galgamer WebPlayer',
      initialBackground: raw.meta?.initialBackground || 'poster.png',
      initialVideo: raw.meta?.initialVideo || 'M1.mp4',
      initialBgm: raw.meta?.initialBgm || null,
      version: raw.meta?.version || 'modern-scenario',
    },
    commands,
    labels,
    initialVariables: raw.initialVariables || {},
  }
}

export function normalizeScenario(raw = rawScenario) {
  if (Array.isArray(raw.commands)) {
    return normalizeModernScenario(raw)
  }

  return normalizeLegacyScenario(raw)
}

export function loadScenario() {
  return normalizeScenario(rawScenario)
}
