import rawScenario from '@/assets/game1.json'

function inferNodeType(node) {
  if (node.character === 'vid') return 'video'
  if (node.character === 'jump') return 'jump'
  if (node.character === 'choose') return 'choice'
  return 'line'
}

export function normalizeScenario(raw = rawScenario) {
  const choicesByQuestion = new Map(
    (raw.choices || []).map((choice) => [choice.question, choice]),
  )

  const nodes = (raw.plot || []).map((node, index) => {
    const type = inferNodeType(node)
    const baseNode = {
      id: index,
      type,
      speaker: node.character || '',
      text: node.say || '',
      visual: node.vision || '',
      voice: node.voice || '',
    }

    if (type === 'choice') {
      const choice = choicesByQuestion.get(node.say)
      return {
        ...baseNode,
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
        ...baseNode,
        target: Number.parseInt(node.say, 10),
      }
    }

    return baseNode
  })

  return {
    nodes,
    meta: {
      title: 'Galgamer WebPlayer Demo',
      initialBackground: 'poster.png',
      initialVideo: 'M1.mp4',
    },
  }
}

export function loadScenario() {
  return normalizeScenario(rawScenario)
}
