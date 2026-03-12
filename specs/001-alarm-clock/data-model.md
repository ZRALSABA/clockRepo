# Data Model: Alarm Clock

**Feature**: 001-alarm-clock  
**Date**: 2026-03-12  
**Phase**: 1 - Data Model Design

## Entities

### Alarm

Represents a scheduled alarm configuration.

**Fields**:
- `id` (string, required): Unique identifier (UUID v4)
- `time` (string, required): Alarm time in "HH:MM" format (24-hour)
- `enabled` (boolean, required): Whether alarm is active
- `label` (string, optional): User-defined alarm name/description
- `recurrence` (array of strings, nullable): Days of week ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], null for one-time alarm
- `snoozeDuration` (number, required): Snooze delay in minutes (default: 5)
- `createdAt` (string, required): ISO 8601 timestamp of creation
- `lastTriggered` (string, nullable): ISO 8601 timestamp of last trigger

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `time`: Must match regex `^([01]\d|2[0-3]):([0-5]\d)$` (00:00 to 23:59)
- `enabled`: Must be boolean
- `label`: Max 50 characters, optional
- `recurrence`: If not null, must be array containing only valid day codes, no duplicates
- `snoozeDuration`: Must be positive integer between 1 and 60 minutes
- `createdAt`: Must be valid ISO 8601 timestamp
- `lastTriggered`: Must be valid ISO 8601 timestamp or null

**State Transitions**:
```
[Created] --enable--> [Enabled]
[Enabled] --disable--> [Disabled]
[Enabled] --trigger--> [Triggering]
[Triggering] --dismiss--> [Enabled] (if recurring) or [Completed] (if one-time)
[Triggering] --snooze--> [Snoozed]
[Snoozed] --trigger--> [Triggering]
[Enabled/Disabled] --delete--> [Deleted]
```

**Relationships**:
- One Alarm can have zero or one active AlarmTrigger instance

---

### AlarmTrigger

Represents an actively triggering alarm requiring user action.

**Fields**:
- `alarmId` (string, required): Reference to parent Alarm.id
- `triggeredAt` (string, required): ISO 8601 timestamp when alarm triggered
- `snoozedCount` (number, required): Number of times snoozed (default: 0)
- `nextTriggerTime` (string, nullable): ISO 8601 timestamp for next trigger if snoozed

**Validation Rules**:
- `alarmId`: Must reference existing Alarm.id
- `triggeredAt`: Must be valid ISO 8601 timestamp
- `snoozedCount`: Must be non-negative integer
- `nextTriggerTime`: Must be valid ISO 8601 timestamp or null

**Lifecycle**:
- Created when alarm time matches current time and alarm is enabled
- Destroyed when user dismisses alarm
- Updated when user snoozes alarm (increment snoozedCount, set nextTriggerTime)

**Relationships**:
- Belongs to one Alarm (via alarmId)

---

### AppState

Represents global application state (not persisted, runtime only).

**Fields**:
- `currentTime` (Date, required): Current time updated every second
- `activeAlarms` (array of Alarm, required): All alarms loaded from storage
- `triggeringAlarms` (array of AlarmTrigger, required): Currently triggering alarms
- `audioContext` (AudioContext, nullable): Web Audio API context for playing sounds

**Lifecycle**:
- Initialized on application load
- Updated continuously during runtime
- Not persisted to storage

---

## Storage Schema

### localStorage Key: `alarmClockData`

**Structure**:
```json
{
  "version": 1,
  "alarms": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "time": "07:00",
      "enabled": true,
      "label": "Wake up",
      "recurrence": ["mon", "tue", "wed", "thu", "fri"],
      "snoozeDuration": 5,
      "createdAt": "2026-03-12T07:00:00.000Z",
      "lastTriggered": null
    }
  ]
}
```

**Schema Version**: 1  
**Migration Strategy**: Check version on load, apply migrations if needed for future schema changes

---

## Data Flow

### Alarm Creation
1. User inputs time, label, recurrence via UI
2. Validate input fields
3. Generate UUID for new alarm
4. Create Alarm object with defaults (enabled: true, snoozeDuration: 5)
5. Add to activeAlarms array
6. Persist to localStorage
7. Update UI

### Alarm Trigger Detection
1. Every second, compare current time to all enabled alarms
2. For each match:
   - Check if alarm should trigger today (based on recurrence)
   - Check if not already triggered this minute
   - Create AlarmTrigger instance
   - Play audio alert
   - Show dismiss/snooze UI

### Alarm Dismiss
1. User clicks dismiss on triggering alarm
2. Remove AlarmTrigger from triggeringAlarms
3. Update alarm.lastTriggered timestamp
4. If one-time alarm, set enabled: false
5. Stop audio playback
6. Persist changes to localStorage
7. Update UI

### Alarm Snooze
1. User clicks snooze on triggering alarm
2. Calculate nextTriggerTime = now + snoozeDuration
3. Update AlarmTrigger (increment snoozedCount, set nextTriggerTime)
4. Stop audio playback
5. Hide dismiss/snooze UI temporarily
6. When nextTriggerTime reached, re-trigger alarm

---

## Constraints

- **localStorage limit**: 5-10MB (typical), alarm data ~100 bytes each, supports 1000+ alarms
- **Time precision**: 1-second polling interval, alarms accurate to ±1 second
- **Concurrency**: Single-user, no concurrent access concerns
- **Browser compatibility**: Requires localStorage, Web Audio API, ES6+ support (all modern browsers)
