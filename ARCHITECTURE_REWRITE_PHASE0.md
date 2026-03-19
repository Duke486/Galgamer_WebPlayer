# Architecture Rewrite Phase 0

> Objective: keep the current story experience unchanged while rebuilding the bottom layer into a maintainable visual novel runtime.

## Scope

This phase intentionally does **not** change the current player-facing story flow, assets, or branch outcomes.

We will reuse the existing:
- plot content
- choices
- images
- video assets
- voice assets
- basic click-to-advance interaction model

What changes is the internal architecture.

## Problems in the current implementation

The original implementation puts nearly everything inside a single Vue component:

- raw story data is coupled to UI rendering
- script interpretation is mixed with button click handlers
- command semantics are implicit (`character === 'vid'`, `character === 'jump'`, `character === 'choose'`)
- runtime state is spread across many UI fields
- branching logic depends on ad-hoc lookups
- there is no stable state object suitable for save/load

This works for a demo, but it becomes fragile as soon as we add:
- save/load
- rollback
- localization
- debugging tools
- asset preloading
- more command types

## Phase 0 target architecture

We split the system into four layers.

### 1. Content layer
Responsible for loading and normalizing scenario data.

Responsibilities:
- import existing JSON scenario
- normalize old demo schema into explicit command-like entries
- expose structured content to runtime

### 2. Runtime layer
Responsible for deterministic story execution.

Responsibilities:
- hold authoritative story state
- advance execution pointer
- resolve jump / choose / media / dialogue commands
- expose a serializable snapshot
- avoid direct Vue or DOM coupling

### 3. Presentation state layer
Responsible for mapping runtime output into UI-friendly view state.

Responsibilities:
- tell UI what to display now
- expose current background / video / voice / text / choice state
- keep the same current experience while hiding runtime details from components

### 4. Vue UI layer
Responsible only for rendering and input.

Responsibilities:
- render image/video/text/buttons/dialogs
- call runtime actions such as `advance`, `choose`, `restart`
- avoid owning narrative logic

## Proposed module layout

```text
src/
  engine/
    content/
      scenarioLoader.js
    runtime/
      createRuntime.js
      runtimeState.js
    index.js
```

This is a minimal Phase 0 layout. It is enough to separate concerns without overengineering too early.

## Runtime state model

The runtime should own one canonical state object.

```js
{
  started: false,
  finished: false,
  pointer: 0,
  background: 'poster.png',
  video: null,
  voice: null,
  currentNode: null,
  currentChoice: null
}
```

In later phases this can expand with:
- variables
- flags
- backlog
- read/unread marks
- save metadata
- BGM state
- transition state

## Command model

The current demo uses overloaded fields in a flat JSON array. For compatibility, we keep the source data, but normalize it into explicit command categories internally.

Derived command categories for Phase 0:
- `video`
- `jump`
- `choice`
- `line`
- `end`

Interpretation rules from current demo:
- `character === 'vid'` => `video`
- `character === 'jump'` => `jump`
- `character === 'choose'` => `choice`
- everything else => `line`

This gives us compatibility now, while making a future script schema migration straightforward.

## Compatibility contract

Phase 0 compatibility means:
- same story order
- same choice destinations
- same dialogue text
- same image / video / voice references
- same visible user flow: start -> click advance -> choose -> continue -> end

## Deliverables for this phase

1. Introduce engine modules under `src/engine`
2. Move story interpretation logic out of the Vue component
3. Keep UI rendering mostly unchanged
4. Preserve the current scenario experience
5. Make future save/load possible by centralizing state

## Exit criteria

Phase 0 is complete when:
- the demo plays exactly like before from the user perspective
- Vue component no longer interprets raw scenario logic directly
- runtime state is inspectable and serializable in principle
- future phases can build on stable engine interfaces instead of component-local hacks

## Next step after Phase 0

Once this structure is stable, Phase 1 can add:
- explicit script schema
- stronger command typing
- variables and conditions
- backlog and save/load groundwork
- better authoring validation
