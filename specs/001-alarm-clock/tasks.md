# Tasks: Alarm Clock

**Input**: Design documents from `/specs/001-alarm-clock/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests requested - manual testing per quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All files in repository root with components/ and services/ subdirectories.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (components/, services/)
- [X] T002 [P] Create index.html with basic HTML5 structure and container elements
- [X] T003 [P] Create styles.css with base styles and layout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement StorageService in services/storage.js (localStorage wrapper with error handling)
- [X] T005 [P] Implement TimeService in services/time-service.js (time tracking, formatting, recurrence logic)
- [X] T006 Create AlarmService skeleton in services/alarm-service.js (CRUD methods, trigger detection)
- [X] T007 [P] Create Clock component in components/clock.js (display current time, update every second)
- [X] T008 Initialize app.js with service instantiation and Clock component initialization

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Set and Trigger Alarm (Priority: P1) 🎯 MVP

**Goal**: User can set a single alarm, have it trigger at the specified time with audio alert, and dismiss it

**Independent Test**: Set alarm for current time + 5 seconds, wait, verify alarm triggers with beep sound, dismiss alarm

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement alarm creation in AlarmService (createAlarm method with validation)
- [X] T010 [P] [US1] Implement alarm storage persistence in AlarmService (save to localStorage via StorageService)
- [X] T011 [US1] Implement alarm trigger detection in AlarmService (checkTriggers method with setInterval)
- [X] T012 [US1] Implement audio playback in AlarmService (Web Audio API with OscillatorNode for beep sound)
- [X] T013 [P] [US1] Create AlarmForm component in components/alarm-form.js (time input, label input, validation)
- [X] T014 [P] [US1] Create AlarmTrigger component in components/alarm-trigger.js (dismiss button, audio stop)
- [X] T015 [US1] Implement alarm dismiss logic in AlarmService (dismissAlarm method, stop audio, update state)
- [X] T016 [US1] Wire AlarmForm to AlarmService in app.js (form submission creates alarm)
- [X] T017 [US1] Wire AlarmTrigger to AlarmService in app.js (trigger detection shows UI, dismiss stops alarm)
- [X] T018 [US1] Add basic alarm display in index.html (show created alarm with time and label)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Manage Multiple Alarms (Priority: P2)

**Goal**: User can create, view, edit, and delete multiple alarms with persistence

**Independent Test**: Create 3 alarms with different times, verify all listed, edit one, delete one, verify changes persist

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement getAlarm method in AlarmService (retrieve single alarm by ID)
- [ ] T020 [P] [US2] Implement getAllAlarms method in AlarmService (retrieve all alarms from storage)
- [ ] T021 [P] [US2] Implement updateAlarm method in AlarmService (edit existing alarm, persist changes)
- [ ] T022 [P] [US2] Implement deleteAlarm method in AlarmService (remove alarm, update storage)
- [ ] T023 [P] [US2] Implement toggleAlarm method in AlarmService (enable/disable alarm without deleting)
- [ ] T024 [US2] Create AlarmList component in components/alarm-list.js (display all alarms, enable/disable toggle, edit/delete buttons)
- [ ] T025 [US2] Update AlarmForm component to support edit mode (populate form with existing alarm data)
- [ ] T026 [US2] Wire AlarmList to AlarmService in app.js (load all alarms on startup, handle edit/delete/toggle events)
- [ ] T027 [US2] Update trigger detection to handle multiple alarms in AlarmService (check all enabled alarms each second)
- [ ] T028 [US2] Add alarm list container to index.html (replace basic display from US1)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Recurring Alarms (Priority: P3)

**Goal**: User can set alarms to repeat on specific days of the week

**Independent Test**: Set alarm for current time + 1 minute on current weekday only, verify it triggers today, verify it doesn't trigger on other days

### Implementation for User Story 3

- [ ] T029 [P] [US3] Add recurrence field to Alarm data model in AlarmService (array of day codes or null)
- [ ] T030 [P] [US3] Implement shouldTriggerToday method in TimeService (check if alarm should trigger based on recurrence and current day)
- [ ] T031 [US3] Update checkTriggers in AlarmService to use shouldTriggerToday (skip alarms not scheduled for current day)
- [ ] T032 [US3] Update AlarmForm component to include recurrence selection (checkboxes for Mon-Sun)
- [ ] T033 [US3] Update AlarmList component to display recurrence pattern (show selected days)
- [ ] T034 [US3] Update dismiss logic to keep recurring alarms enabled after trigger (only disable one-time alarms)
- [ ] T035 [US3] Add recurrence UI to index.html in alarm form section

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional

---

## Phase 6: User Story 4 - Snooze Functionality (Priority: P3)

**Goal**: User can snooze a triggering alarm to delay it by configurable duration

**Independent Test**: Trigger alarm, press snooze, verify alarm stops temporarily and re-triggers after snooze duration

### Implementation for User Story 4

- [ ] T036 [P] [US4] Add snoozeDuration field to Alarm data model in AlarmService (default 5 minutes)
- [ ] T037 [P] [US4] Implement snoozeAlarm method in AlarmService (calculate next trigger time, stop audio, reschedule)
- [ ] T038 [P] [US4] Add AlarmTrigger entity tracking in AlarmService (track snoozed alarms with nextTriggerTime)
- [ ] T039 [US4] Update checkTriggers to handle snoozed alarms (check nextTriggerTime for snoozed alarms)
- [ ] T040 [US4] Update AlarmTrigger component to include snooze button (alongside dismiss button)
- [ ] T041 [US4] Update AlarmForm component to include snooze duration input (1-60 minutes)
- [ ] T042 [US4] Wire snooze button to AlarmService in app.js (call snoozeAlarm on click)
- [ ] T043 [US4] Add snooze UI elements to index.html in trigger modal

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add input validation and error messages to AlarmForm component (invalid time, empty required fields)
- [ ] T045 [P] Add visual feedback for alarm states in AlarmList (enabled/disabled styling, next trigger time display)
- [ ] T046 [P] Improve styles.css with responsive design and better visual hierarchy
- [ ] T047 Add edge case handling for past times in AlarmService (schedule for next occurrence)
- [ ] T048 Add edge case handling for multiple simultaneous alarms in AlarmService (trigger all at once)
- [ ] T049 [P] Add user warning in UI about browser tab requirement (must keep tab open for alarms)
- [ ] T050 [P] Add localStorage availability check on startup with user-friendly error message
- [ ] T051 Run manual test scenarios from quickstart.md (all 6 test scenarios)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1/US2 but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for User Story 1:
Task: "Implement alarm creation in AlarmService" (T009)
Task: "Implement alarm storage persistence in AlarmService" (T010)
Task: "Create AlarmForm component in components/alarm-form.js" (T013)
Task: "Create AlarmTrigger component in components/alarm-trigger.js" (T014)

# Then sequential tasks:
Task: "Implement alarm trigger detection in AlarmService" (T011) - depends on T009, T010
Task: "Implement audio playback in AlarmService" (T012) - depends on T011
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Test 1
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests - use manual test scenarios from quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
