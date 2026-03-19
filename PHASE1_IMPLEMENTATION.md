# Phase 1 Implementation Notes

This document records the practical implementation direction for Phase 1 of the engine rewrite.

## Phase 1 goals

Phase 1 is no longer treated as a throwaway demo refactor. Its purpose is to establish a durable foundation for a long-lived visual novel engine while preserving the current story experience.

Current priorities:
- keep existing story flow unchanged
- make runtime command handling explicit
- support future extensibility without component-level rewrites
- redesign the UI to feel like an actual visual novel presentation

## Implemented in this step

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
- lightweight status ribbon added for runtime visibility during rewrite stage

## Why this matters

This keeps the current story working, while making the codebase ready for:
- save/load
- backlog UI
- variables and branching expansion
- command-driven script schema migration
- future audio and presentation systems

## Recommended next Phase 1 follow-ups

1. add explicit save/load serialization format
2. add backlog UI backed by runtime history
3. add script validation for command schema
4. add BGM asset support and audio channel manager
5. split UI into dedicated components instead of a single scene file
