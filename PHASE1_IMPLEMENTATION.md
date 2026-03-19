# Phase 1 Implementation Notes

This document records the practical implementation direction for Phase 1 of the engine rewrite.

## Phase 1 goals

Phase 1 is no longer treated as a throwaway demo refactor. Its purpose is to establish a durable foundation for a long-lived visual novel engine while preserving the current story experience.

Current priorities:
- keep existing story flow unchanged
- make runtime command handling explicit
- support future extensibility without component-level rewrites
- redesign the UI to feel like an actual visual novel presentation

## Implemented in Phase 1 round 1

### Runtime improvements
- scenario loader now supports two paths:
  - legacy `plot + choices` schema
  - future-facing `commands` schema
- runtime now understands a broader command model:
  - `line`
  - `video`
  - `choice`
  - `jump`
  - `label`
  - `set`
  - `jumpIf`
  - `bgm`
- runtime owns variables and history state
- runtime exposes `restore()` in addition to `advance()`, `choose()`, and `restart()`

### UI redesign goals achieved
- moved interaction into the scene instead of external page controls
- primary action cluster placed at the bottom-right inside the stage
- title screen rebuilt into a cinematic overlay
- dialogue panel redesigned as an in-scene VN textbox
- choices redesigned into a focused floating panel

## Implemented in Phase 1 round 2

### Player-facing systems
- added local save support using runtime snapshots + `localStorage`
- added local load support through runtime `restore()`
- added backlog viewer based on runtime history
- added in-scene menu overlay for save / load / backlog / return-to-title

### UI refinement goals achieved
- removed top-right gameplay labels and buttons for a cleaner composition
- redesigned controls into smaller, icon-based, transparent in-scene buttons
- refined nameplate styling to better separate speaker identity from body text
- upgraded body text with stronger readability treatment using layered text-shadow for a subtle outline feel
- kept controls inside the stage instead of outside the frame, matching common VN interaction patterns

## Why this matters

This keeps the current story working, while making the codebase ready for:
- durable save/load
- backlog UI
- variables and branching expansion
- command-driven script schema migration
- future audio and presentation systems

## Recommended next Phase 1 follow-ups

1. move save slots from single autosave-style storage to named slots
2. add settings menu for text speed / volume / UI opacity
3. split scene UI into dedicated components (`DialogueBox`, `ControlCluster`, `BacklogPanel`, `SystemMenu`)
4. add BGM asset support and audio channel manager
5. create a modern first-class scenario format file to replace the legacy compatibility layer over time
