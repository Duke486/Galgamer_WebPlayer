# Galgamer WebPlayer Rewrite Roadmap

> Goal: define what a qualified modern visual novel engine should support, which parts are realistic for this project to implement under a full rewrite, and in what order they should be built.

## 1. What a qualified visual novel engine should provide

A solid visual novel engine should cover at least these capability groups:

### A. Core narrative runtime
- Script parser / interpreter
- Dialogue display and speaker system
- Character sprite show / hide / replace / position
- Background switching
- Music / sound effect / voice playback
- Basic transitions and timing control
- Branching choices, flags, variables, conditionals, jumps
- Save / load and rollback / backlog
- Auto mode / skip mode / unread-read tracking

### B. Presentation and user experience
- Responsive UI for desktop and mobile
- Text speed, audio, and display preferences
- Polished dialogue box, name box, history view, settings panel
- CG gallery / music room / chapter select
- Accessibility features such as keyboard navigation, high contrast, reduced motion, readable font sizing

### C. Content pipeline
- Clear script format
- Asset manifest and preload strategy
- Validation tooling for scripts and assets
- Localization / multi-language support
- Editor-friendly conventions and documentation

### D. Engine architecture
- Clean separation between runtime state, script execution, renderer, and UI shell
- Plugin / extension points for custom commands
- Deterministic state serialization
- Good error messages and debug tools
- Testable modules instead of a monolithic page app

### E. Platform and delivery
- Fast first load and lazy loading for heavy assets
- Browser compatibility and mobile touch support
- Optional PWA / offline cache
- Packaging strategy for self-hosted deployment

## 2. What is realistic for this project to implement in a full rewrite

Under a full rewrite, the following set is both ambitious and realistic:

### Must-have rewrite targets
- New script runtime with explicit command model
- Save / load / rollback / backlog
- Variables, flags, conditionals, and choices
- Layered scene system: background, character, effect, UI
- Audio manager for BGM / SE / voice with fade support
- Stable asset loader with preload hints
- Settings system and persistent user preferences
- Mobile-friendly responsive UI
- Script and asset validation CLI

### Strongly recommended
- Transition / animation framework
- Localization-ready text architecture
- Gallery / chapter unlock support
- Debug overlay and step execution tools
- Plugin-style custom command registration

### Possible but later-phase
- Live2D or advanced character animation
- WebGL effect stack
- Online save sync
- In-browser scenario editor
- Mod support with sandboxing
- Replay recording / deterministic re-simulation

### Probably not first rewrite priorities
- Multiplayer or co-watch mode
- AI-assisted story tooling inside the runtime itself
- Heavy cinematic systems comparable to 3D engines
- Huge visual effect framework before core script stability

## 3. Recommended rewrite principles

1. **Script first**: the heart of a visual novel engine is deterministic narrative execution.
2. **State must be serializable**: if a state cannot be saved reliably, the runtime model is incomplete.
3. **Renderer should be replaceable**: story logic should not be tightly coupled to a Vue component tree.
4. **Content authors need tooling**: a usable engine is not only a player, but also a safe content pipeline.
5. **Mobile matters early**: many players will touch this on phones.
6. **Debuggability is a feature**: authors need line-level, command-level, and asset-level visibility.

## 4. Proposed roadmap

## Phase 0 - Rewrite planning and architecture foundation

### Goals
- Define the new engine boundaries
- Prevent another tightly-coupled rewrite trap

### Deliverables
- Runtime architecture document
- Scene graph / state model design
- Script command schema definition
- Save-state schema draft
- Asset manifest format draft

### Suggested tasks
- Split the project into conceptual modules: `runtime`, `renderer`, `ui`, `content`, `tooling`
- Define a command-oriented script format, e.g. dialogue, showSprite, setBg, playBgm, choice, jump, setVar
- Decide how execution pointer, variables, history, and currently mounted assets are serialized
- Establish compatibility policy: full break from old format or migration layer

## Phase 1 - Minimal playable core

### Goals
Build the smallest engine that can actually play a short branching story.

### Deliverables
- Script loader
- Command interpreter
- Dialogue UI
- Background / sprite rendering
- Choice system
- Variable and conditional support
- BGM / SE playback

### Success criteria
- A simple demo route with at least one branch can be fully played in browser
- Runtime state can advance deterministically command by command

## Phase 2 - Save / load quality-of-life foundation

### Goals
Turn the prototype into a usable VN engine.

### Deliverables
- Manual save / load
- Quick save / quick load
- Backlog
- Auto / skip / read tracking
- Settings panel
- Persistent preferences in local storage
- Basic rollback support

### Success criteria
- Player can leave and resume reliably
- Reader-quality UX reaches baseline expectations of modern VN players

## Phase 3 - Asset pipeline and performance

### Goals
Make the engine robust for larger stories.

### Deliverables
- Asset manifest and preload queue
- Progressive / lazy loading strategies
- Error fallback screens for missing assets
- Script validator and asset existence checker
- Build-time content checks

### Success criteria
- Broken content is caught before shipping
- Scene switches become predictable and smoother

## Phase 4 - Presentation polish

### Goals
Improve immersion and production quality.

### Deliverables
- Transition framework
- Character positioning presets
- Layer effects
- Voice playback integration
- Better text presentation and typography
- CG gallery / chapter select

### Success criteria
- Demo looks like a deliberate VN engine, not a generic page app with dialogue

## Phase 5 - Authoring and debugging tools

### Goals
Reduce content creation friction.

### Deliverables
- Debug panel showing current label, command index, variables, flags
- Jump-to-label dev tool
- Fast-forward to line / scene tool
- Script linting and schema validation
- Better docs and sample projects

### Success criteria
- Creating and debugging a new scenario no longer requires source diving

## Phase 6 - Advanced extensibility

### Goals
Support project-specific features without hacking core runtime.

### Deliverables
- Plugin / custom command API
- Localization framework
- Optional advanced animation hooks
- PWA / offline support if desired

### Success criteria
- New project-specific behavior can be added through extension points rather than engine rewrites

## 5. Practical implementation order for this repository

If we were actually starting the rewrite now, the practical order should be:

1. Freeze current demo behavior and document existing features
2. Design script command schema and save-state schema
3. Implement new runtime core independent from Vue UI details
4. Rebuild minimal renderer and dialogue UI on top of that runtime
5. Add choices / variables / jumps / audio
6. Add save / load / backlog / skip / auto
7. Add content validation and asset pipeline
8. Add polish systems such as transitions, gallery, debug tools
9. Add extension system and localization support

## 6. Immediate recommendation

The best next move is **not** to jump straight into fancy effects.

The highest-value rewrite target is:

- a deterministic script runtime,
- a stable save-state model,
- and a clear content format.

If these three are designed well, most later features become incremental. If these three are weak, every future feature becomes fragile.

## 7. Suggested near-term milestone definition

A reasonable first milestone for the full rewrite would be:

- Play one complete short chapter
- Support branching choices
- Support save / load
- Support backlog
- Support BGM / SE
- Support responsive desktop + mobile UI
- Support script validation for demo content

That milestone would already qualify as a credible foundational VN engine rewrite.
