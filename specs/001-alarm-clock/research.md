# Research: Alarm Clock

**Feature**: 001-alarm-clock  
**Date**: 2026-03-12  
**Phase**: 0 - Research & Technology Decisions

## Research Tasks

### 1. Testing Framework for Vanilla JavaScript Web Application

**Decision**: Manual testing for MVP, optional Jest for future automated testing

**Rationale**:
- Vanilla JavaScript SPA with no build process simplifies development
- Manual testing sufficient for MVP with 4 user stories
- Browser-based features (localStorage, Audio API, timers) are straightforward to test manually
- Automated testing would require build tooling (npm, bundler) which contradicts "no dependencies" approach
- If automated tests needed later, Jest + jsdom can be added without refactoring code

**Alternatives Considered**:
- **Jest + jsdom**: Industry standard, but requires Node.js build setup and npm dependencies
- **Playwright/Cypress**: E2E testing, overkill for simple SPA, requires test infrastructure
- **QUnit**: Lightweight, but still requires setup and doesn't justify complexity for MVP
- **Manual testing**: Fastest path to MVP, aligns with "no dependencies" constraint

**Best Practices**:
- Structure code with testability in mind (pure functions, dependency injection)
- Keep business logic separate from DOM manipulation
- Document manual test scenarios in quickstart.md
- Consider automated tests post-MVP if project grows

### 2. Browser Audio API for Alarm Sound

**Decision**: Use Web Audio API with OscillatorNode for beep sound

**Rationale**:
- No external audio files needed (aligns with no-dependency approach)
- OscillatorNode can generate simple beep tones programmatically
- Supported in all modern browsers
- Lightweight and reliable

**Implementation Pattern**:
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 800; // 800 Hz beep
oscillator.connect(audioContext.destination);
oscillator.start();
oscillator.stop(audioContext.currentTime + 1); // 1 second beep
```

**Alternatives Considered**:
- **HTMLAudioElement with data URI**: More complex, less control
- **External audio file**: Requires asset management, HTTP requests
- **Browser alert() beep**: Not customizable, blocks UI

### 3. Time Tracking and Alarm Trigger Mechanism

**Decision**: setInterval polling every second with Date comparison

**Rationale**:
- Simple and reliable for 1-second accuracy requirement
- setInterval runs in background tabs (with throttling, but sufficient for alarm clock)
- No complex scheduling logic needed
- Handles multiple alarms naturally by checking all on each tick

**Implementation Pattern**:
```javascript
setInterval(() => {
  const now = new Date();
  const currentTime = `${now.getHours()}:${now.getMinutes()}`;
  
  alarms.forEach(alarm => {
    if (alarm.enabled && alarm.time === currentTime && !alarm.triggered) {
      triggerAlarm(alarm);
    }
  });
}, 1000);
```

**Alternatives Considered**:
- **setTimeout with calculated delays**: More complex, harder to manage multiple alarms
- **Web Workers**: Overkill for simple polling, adds complexity
- **Service Workers**: Requires PWA setup, can't play audio in background

### 4. localStorage Data Structure

**Decision**: Store alarms as JSON array with schema versioning

**Rationale**:
- Simple serialization/deserialization
- Easy to iterate and filter
- Schema version allows future migrations

**Data Schema**:
```javascript
{
  version: 1,
  alarms: [
    {
      id: "uuid-string",
      time: "07:00",
      enabled: true,
      label: "Wake up",
      recurrence: ["mon", "tue", "wed", "thu", "fri"], // or null for one-time
      snoozeDuration: 5 // minutes
    }
  ]
}
```

**Alternatives Considered**:
- **IndexedDB**: Overkill for simple alarm list, more complex API
- **Separate localStorage keys per alarm**: Harder to query all alarms
- **sessionStorage**: Doesn't persist across browser restarts

## Technology Stack Summary

| Component | Technology | Justification |
|-----------|------------|---------------|
| Language | Vanilla JavaScript ES6+ | No build process, runs directly in browser |
| UI | HTML5 + CSS3 | Native web technologies, no framework overhead |
| Storage | localStorage | Built-in, persistent, simple API |
| Audio | Web Audio API (OscillatorNode) | No external files, programmatic beep generation |
| Time Tracking | setInterval + Date | Simple, reliable, meets 1-second accuracy |
| Testing | Manual (MVP) | Fastest to MVP, automated tests optional later |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Browser tab must stay open | Document clearly in UI and quickstart.md |
| setInterval throttling in background tabs | Acceptable for 1-second accuracy, test across browsers |
| localStorage size limits (5-10MB) | 10 alarms = ~1KB, well within limits |
| Audio autoplay policies | Require user interaction before first alarm, document in quickstart |
| Time zone changes | Use local time consistently, document edge case |

## Open Questions

None - all technical decisions resolved for MVP implementation.
