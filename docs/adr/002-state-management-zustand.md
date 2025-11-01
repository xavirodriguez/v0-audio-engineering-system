# ADR 002: Zustand for State Management

## Status

Accepted

## Context

The application needs centralized state management for:
- Pitch detection state (audio context, analyser, detector)
- Recording state (audio blobs, session data)
- Exercise state (student profile, recommendations, progress)

Previous implementation used multiple custom hooks with localStorage, leading to:
- State synchronization issues
- Duplicate logic across hooks
- Difficult testing and debugging

## Decision

Use Zustand for centralized state management with:
- Separate stores for different domains (pitch, recording, exercises)
- Persist middleware for selective localStorage sync
- IndexedDB adapter for large data (audio blobs)

## Consequences

### Positive
- Single source of truth for each domain
- Easy to test stores independently
- Built-in persistence with selective serialization
- Minimal boilerplate compared to Redux
- Excellent TypeScript support

### Negative
- Additional dependency (though lightweight: ~1KB)
- Learning curve for team members unfamiliar with Zustand
- Need to migrate existing localStorage logic

## Alternatives Considered

### Redux Toolkit
- **Rejected**: Too much boilerplate for our use case
- Overkill for application size

### React Context + useReducer
- **Rejected**: Performance issues with frequent updates
- Difficult to persist state

### Jotai/Recoil
- **Rejected**: Atomic state model not ideal for our domain structure
- Less mature ecosystem

## Implementation Notes

- Three main stores: `pitchDetectionStore`, `recordingStore`, `exerciseStore`
- Use `persist` middleware with custom storage adapter
- IndexedDB for audio blobs, localStorage for configuration
- Selectors for derived state to avoid unnecessary re-renders

## Migration Plan

1. Create Zustand stores with same API as existing hooks
2. Update hooks to use stores internally (wrapper pattern)
3. Gradually migrate components to use stores directly
4. Remove wrapper hooks once migration complete
