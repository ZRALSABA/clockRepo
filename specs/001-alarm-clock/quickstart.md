# Quickstart: Alarm Clock

**Feature**: 001-alarm-clock  
**Date**: 2026-03-12

This guide walks through setting up, running, and testing the alarm clock web application.

## Prerequisites

- Modern web browser (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Text editor (for viewing/editing code)
- No build tools or dependencies required

## Setup

1. **Clone/navigate to repository**:
   ```bash
   cd /path/to/firstproject
   ```

2. **Verify file structure**:
   ```
   index.html
   styles.css
   app.js
   components/
   ├── clock.js
   ├── alarm-list.js
   ├── alarm-form.js
   └── alarm-trigger.js
   services/
   ├── alarm-service.js
   ├── storage.js
   └── time-service.js
   ```

3. **Open in browser**:
   - **Option A**: Double-click `index.html` to open in default browser
   - **Option B**: Use local server (recommended for development):
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Python 2
     python -m SimpleHTTPServer 8000
     
     # Node.js (if installed)
     npx http-server
     ```
     Then navigate to `http://localhost:8000`

## Usage

### Setting Your First Alarm

1. Open the application in your browser
2. Click "Add Alarm" button
3. Set time (e.g., current time + 2 minutes for testing)
4. Optionally add a label (e.g., "Test Alarm")
5. Click "Save"
6. Alarm appears in the list with enabled toggle ON
7. Wait for alarm to trigger - you'll hear a beep sound

### Managing Alarms

**View all alarms**: Main screen shows list of all alarms with time, label, and status

**Enable/Disable alarm**: Toggle switch next to each alarm

**Edit alarm**: Click edit icon, modify fields, click "Save"

**Delete alarm**: Click delete icon, confirm deletion

### Recurring Alarms

1. Click "Add Alarm" or edit existing alarm
2. Check "Recurring" option
3. Select days of week (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
4. Save alarm
5. Alarm will trigger only on selected days

### Snooze Functionality

1. When alarm triggers, you'll see dismiss and snooze buttons
2. Click "Snooze" to delay alarm by configured duration (default: 5 minutes)
3. Click "Dismiss" to stop alarm completely
4. Configure snooze duration in alarm settings (1-60 minutes)

## Testing Scenarios

### Test 1: Basic Alarm (P1 - MVP)

**Objective**: Verify alarm creation and triggering

1. Open application
2. Create alarm for current time + 1 minute
3. Wait for alarm to trigger
4. Verify beep sound plays
5. Click "Dismiss"
6. Verify alarm stops

**Expected**: Alarm triggers within 1 second of target time, audio plays, dismiss works

---

### Test 2: Multiple Alarms (P2)

**Objective**: Verify multiple alarm management

1. Create 3 alarms with different times (e.g., +1 min, +2 min, +3 min)
2. Verify all 3 appear in list
3. Edit second alarm to change time
4. Delete third alarm
5. Verify only 2 alarms remain
6. Wait for first alarm to trigger
7. Dismiss first alarm
8. Wait for second alarm to trigger

**Expected**: All alarms trigger independently, edits persist, deletions work

---

### Test 3: Recurring Alarm (P3)

**Objective**: Verify recurring alarm behavior

1. Create alarm for current time + 1 minute
2. Set recurrence to current day only (e.g., if today is Monday, select Monday)
3. Wait for alarm to trigger
4. Dismiss alarm
5. Verify alarm remains enabled for next occurrence
6. Change recurrence to exclude current day
7. Set alarm for current time + 1 minute again
8. Wait - alarm should NOT trigger

**Expected**: Alarm triggers on selected days only, remains enabled after trigger

---

### Test 4: Snooze (P3)

**Objective**: Verify snooze functionality

1. Create alarm for current time + 1 minute with 2-minute snooze duration
2. Wait for alarm to trigger
3. Click "Snooze" (not dismiss)
4. Verify alarm stops temporarily
5. Wait 2 minutes
6. Verify alarm triggers again
7. Click "Dismiss"

**Expected**: Snooze delays alarm by configured duration, alarm re-triggers

---

### Test 5: Persistence

**Objective**: Verify localStorage persistence

1. Create 2 alarms
2. Close browser tab
3. Reopen application
4. Verify both alarms still exist with correct settings

**Expected**: All alarm data persists across browser restarts

---

### Test 6: Enable/Disable

**Objective**: Verify alarm enable/disable toggle

1. Create alarm for current time + 1 minute
2. Disable alarm using toggle
3. Wait for target time to pass
4. Verify alarm does NOT trigger
5. Enable alarm again
6. Set time to current time + 1 minute
7. Wait for alarm to trigger

**Expected**: Disabled alarms don't trigger, enabled alarms do

---

## Edge Cases to Test

### Past Time Handling
1. Create alarm for time that already passed today (e.g., if it's 3 PM, set alarm for 10 AM)
2. Verify alarm is scheduled for tomorrow (will trigger at 10 AM next day)

### Invalid Input
1. Try to set alarm with invalid time (e.g., 25:00)
2. Verify validation error message appears
3. Try to save alarm without time
4. Verify required field error

### Browser Tab Closed
1. Create alarm for current time + 2 minutes
2. Close browser tab
3. Wait for alarm time to pass
4. Reopen application
5. Verify alarm did NOT trigger (expected behavior - tab must be open)

### Audio Muted
1. Mute browser or system audio
2. Create alarm for current time + 1 minute
3. Wait for alarm to trigger
4. Verify visual trigger UI appears even if no sound plays

### Multiple Simultaneous Alarms
1. Create 3 alarms for exact same time
2. Wait for trigger time
3. Verify all 3 alarms trigger simultaneously
4. Dismiss each individually

## Troubleshooting

**Alarm doesn't trigger**:
- Verify browser tab is open (alarms don't work with tab closed)
- Check alarm is enabled (toggle is ON)
- Verify time is set correctly
- Check browser console for errors

**No sound plays**:
- Check browser audio permissions
- Verify system volume is not muted
- Try interacting with page first (click something) to satisfy autoplay policies
- Check browser console for Web Audio API errors

**Alarms don't persist**:
- Verify localStorage is enabled in browser settings
- Check browser is not in private/incognito mode
- Look for localStorage quota errors in console

**Time display wrong**:
- Application uses local system time
- Verify system clock is correct
- Check browser timezone settings

## Development Notes

**No build process**: All files are vanilla JavaScript, HTML, CSS - edit and refresh browser

**Debugging**: Open browser DevTools (F12) to view console logs and inspect localStorage

**localStorage inspection**:
```javascript
// In browser console
localStorage.getItem('alarmClockData')
```

**Clear all data**:
```javascript
// In browser console
localStorage.removeItem('alarmClockData')
```

## Known Limitations

1. **Browser tab must remain open** for alarms to trigger (not a background service)
2. **No cross-device sync** - alarms stored locally only
3. **Audio autoplay policies** may require user interaction before first alarm
4. **Background tab throttling** - setInterval may be throttled, but sufficient for 1-second accuracy
5. **No notification API** - audio only, no system notifications

## Next Steps

After verifying all test scenarios:
1. Review code structure in `components/` and `services/`
2. Check data model in `specs/001-alarm-clock/data-model.md`
3. Review component contracts in `specs/001-alarm-clock/contracts/`
4. Proceed to task breakdown with `/agent speckit.tasks`
