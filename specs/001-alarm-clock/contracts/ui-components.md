# UI Component Contracts

**Feature**: 001-alarm-clock  
**Date**: 2026-03-12

This document defines the public interfaces for UI components and services in the alarm clock application.

## Component Interfaces

### Clock Component

**Purpose**: Display current time continuously

**Public API**:
```javascript
class Clock {
  constructor(containerElement)
  start()  // Begin updating display every second
  stop()   // Stop updates
  getTime() // Returns current Date object
}
```

**Events Emitted**: None

**DOM Requirements**: Container element for rendering time display

---

### AlarmList Component

**Purpose**: Display list of all alarms with enable/disable/edit/delete controls

**Public API**:
```javascript
class AlarmList {
  constructor(containerElement, alarmService)
  render(alarms)  // Render alarm list
  onEdit(callback)    // Register edit handler: callback(alarmId)
  onDelete(callback)  // Register delete handler: callback(alarmId)
  onToggle(callback)  // Register enable/disable handler: callback(alarmId, enabled)
}
```

**Events Emitted**:
- `edit`: User clicked edit button (payload: alarmId)
- `delete`: User clicked delete button (payload: alarmId)
- `toggle`: User toggled enabled switch (payload: {alarmId, enabled})

**DOM Requirements**: Container element for rendering alarm list

---

### AlarmForm Component

**Purpose**: Create or edit alarm with time, label, recurrence, snooze settings

**Public API**:
```javascript
class AlarmForm {
  constructor(containerElement)
  show(alarm = null)  // Show form (empty for new, populated for edit)
  hide()              // Hide form
  onSubmit(callback)  // Register submit handler: callback(alarmData)
  onCancel(callback)  // Register cancel handler: callback()
  validate()          // Returns {valid: boolean, errors: string[]}
}
```

**Events Emitted**:
- `submit`: User submitted form (payload: alarmData object)
- `cancel`: User cancelled form

**DOM Requirements**: Container element for rendering form

---

### AlarmTrigger Component

**Purpose**: Display triggering alarm with dismiss/snooze controls

**Public API**:
```javascript
class AlarmTrigger {
  constructor(containerElement)
  show(alarm)         // Show trigger UI for alarm
  hide()              // Hide trigger UI
  onDismiss(callback) // Register dismiss handler: callback(alarmId)
  onSnooze(callback)  // Register snooze handler: callback(alarmId)
}
```

**Events Emitted**:
- `dismiss`: User dismissed alarm (payload: alarmId)
- `snooze`: User snoozed alarm (payload: alarmId)

**DOM Requirements**: Container element for rendering trigger UI (modal/overlay)

---

## Service Interfaces

### AlarmService

**Purpose**: Manage alarm CRUD operations and scheduling logic

**Public API**:
```javascript
class AlarmService {
  constructor(storageService, timeService)
  
  // CRUD operations
  createAlarm(alarmData)      // Returns created Alarm object
  getAlarm(alarmId)           // Returns Alarm object or null
  getAllAlarms()              // Returns array of Alarm objects
  updateAlarm(alarmId, data)  // Returns updated Alarm object
  deleteAlarm(alarmId)        // Returns boolean success
  toggleAlarm(alarmId)        // Toggle enabled state, returns updated Alarm
  
  // Trigger management
  checkTriggers()             // Check if any alarms should trigger now
  triggerAlarm(alarmId)       // Create AlarmTrigger, play sound
  dismissAlarm(alarmId)       // Dismiss triggering alarm
  snoozeAlarm(alarmId)        // Snooze triggering alarm
  
  // Events
  onAlarmTriggered(callback)  // Register trigger handler: callback(alarm)
}
```

**Dependencies**: StorageService, TimeService

---

### StorageService

**Purpose**: Wrapper for localStorage operations with error handling

**Public API**:
```javascript
class StorageService {
  constructor(storageKey = 'alarmClockData')
  
  load()              // Returns {version, alarms} or null
  save(data)          // Saves {version, alarms}, returns boolean success
  clear()             // Clears all data, returns boolean success
  isAvailable()       // Returns boolean if localStorage available
}
```

**Error Handling**: Returns null/false on errors, logs to console

---

### TimeService

**Purpose**: Time tracking and alarm trigger detection

**Public API**:
```javascript
class TimeService {
  constructor()
  
  start(callback)     // Start 1-second interval, calls callback(currentTime)
  stop()              // Stop interval
  getCurrentTime()    // Returns Date object
  formatTime(date)    // Returns "HH:MM" string
  shouldTriggerToday(alarm, currentDate)  // Check if alarm should trigger based on recurrence
}
```

**Dependencies**: None

---

## Data Transfer Objects

### AlarmData (for form submission)

```javascript
{
  time: "07:00",              // Required, HH:MM format
  label: "Wake up",           // Optional, max 50 chars
  recurrence: ["mon", "tue"], // Optional, null for one-time
  snoozeDuration: 5           // Optional, default 5 minutes
}
```

### Alarm (full object)

```javascript
{
  id: "uuid",
  time: "07:00",
  enabled: true,
  label: "Wake up",
  recurrence: ["mon", "tue"],
  snoozeDuration: 5,
  createdAt: "2026-03-12T07:00:00.000Z",
  lastTriggered: null
}
```

### AlarmTrigger

```javascript
{
  alarmId: "uuid",
  triggeredAt: "2026-03-12T07:00:00.000Z",
  snoozedCount: 0,
  nextTriggerTime: null
}
```

---

## Error Handling

All components and services should:
- Validate inputs and return/throw descriptive errors
- Log errors to console for debugging
- Display user-friendly error messages in UI
- Gracefully degrade if localStorage unavailable
- Handle audio playback failures (autoplay policies)

---

## Browser Compatibility

Minimum requirements:
- localStorage API
- Web Audio API (AudioContext, OscillatorNode)
- ES6+ (classes, arrow functions, template literals)
- Modern DOM APIs (querySelector, addEventListener)

Supported browsers: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
