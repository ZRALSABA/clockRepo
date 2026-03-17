import { StorageService } from './services/storage.js';
import { TimeService } from './services/time-service.js';
import { AlarmService } from './services/alarm-service.js';
import { Clock } from './components/clock.js';
import { AlarmForm } from './components/alarm-form.js';
import { AlarmTrigger } from './components/alarm-trigger.js';
import { BUILD_NUMBER, BUILD_DATE } from './version.js';

// Initialize services
const storageService = new StorageService();
const timeService = new TimeService();
const alarmService = new AlarmService(storageService, timeService);

// Initialize Clock component with timezone selector
const clockDisplay = document.getElementById('clock-display');
const clockTimezoneSelect = document.getElementById('clock-timezone');
const clock = new Clock(clockDisplay);

// Set default to Jordan timezone
clockTimezoneSelect.value = 'America/Chicago';
clock.start(timeService, 'America/Chicago');

// Initialize AlarmForm component
const alarmFormContainer = document.getElementById('alarm-form-container');
const alarmForm = new AlarmForm(alarmFormContainer);
alarmForm.defaultTimezone = clockTimezoneSelect.value;

// Handle clock timezone changes
clockTimezoneSelect.addEventListener('change', (e) => {
    clock.setTimezone(e.target.value);
    alarmForm.defaultTimezone = e.target.value;
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️ Light';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

alarmForm.onSubmit((alarmData) => {
    try {
        // Validate that alarm time is not in the past for the selected timezone
        const [hours, minutes] = alarmData.time.split(':');
        const now = new Date();
        
        // Get current time in the alarm's timezone
        const nowInAlarmTZ = new Date(now.toLocaleString('en-US', { timeZone: alarmData.timezone }));
        
        // Create alarm time for today in the alarm's timezone
        const alarmTimeToday = new Date(nowInAlarmTZ);
        alarmTimeToday.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Check if alarm time has already passed today
        if (alarmTimeToday <= nowInAlarmTZ) {
            const confirm = window.confirm(
                `This time (${alarmData.time}) has already passed in ${alarmData.timezone}.\n\n` +
                `The alarm will be set for tomorrow. Continue?`
            );
            if (!confirm) {
                return;
            }
        }
        
        const alarm = alarmService.createAlarm(alarmData);
        console.log('Alarm created:', alarm);
        renderAlarmDisplay();
    } catch (error) {
        alert(error.message);
    }
});

// Initialize AlarmTrigger component
const alarmTriggerContainer = document.getElementById('alarm-trigger-container');
const alarmTrigger = new AlarmTrigger(alarmTriggerContainer);
const alarmTriggerModal = document.getElementById('alarm-trigger-modal');

alarmTrigger.onDismiss((alarmId) => {
    alarmService.dismissAlarm(alarmId);
    alarmTriggerModal.classList.add('hidden');
    renderAlarmDisplay();
});

// Handle alarm triggers
alarmService.onAlarmTriggered((alarm) => {
    alarmTrigger.show(alarm);
    alarmTriggerModal.classList.remove('hidden');
});

// Start trigger detection
alarmService.startTriggerDetection();

// Simple alarm display for US1
function renderAlarmDisplay() {
    const alarmListContainer = document.getElementById('alarm-list-container');
    const now = new Date();
    const getNextTriggerMs = (alarm) => {
        const [h, m] = alarm.time.split(':').map(Number);
        const nowInTZ = new Date(now.toLocaleString('en-US', { timeZone: alarm.timezone }));
        const target = new Date(nowInTZ);
        target.setHours(h, m, 0, 0);
        if (target <= nowInTZ) target.setDate(target.getDate() + 1);
        return target - nowInTZ;
    };
    const alarms = [...alarmService.alarms].sort((a, b) => getNextTriggerMs(a) - getNextTriggerMs(b));
    
    if (alarms.length === 0) {
        alarmListContainer.innerHTML = '<p>No alarms set</p>';
        return;
    }
    
    const timezoneNames = {
        'America/New_York': 'Eastern',
        'America/Chicago': 'Central',
        'America/Denver': 'Mountain',
        'America/Los_Angeles': 'Pacific',
        'America/Phoenix': 'Arizona',
        'America/Anchorage': 'Alaska',
        'Pacific/Honolulu': 'Hawaii',
        'Asia/Amman': 'Jordan',
        'Europe/London': 'London',
        'Europe/Paris': 'Paris',
        'Asia/Tokyo': 'Tokyo',
        'Asia/Shanghai': 'Shanghai',
        'Asia/Dubai': 'Dubai',
        'Australia/Sydney': 'Sydney'
    };
    
    const enabledAlarms = alarms.filter(a => a.enabled);
    const disabledAlarms = alarms.filter(a => !a.enabled);

    const renderCard = (alarm) => {
        const [hours24, minutes] = alarm.time.split(':');
        const hours12 = parseInt(hours24) % 12 || 12;
        const ampm = parseInt(hours24) >= 12 ? 'PM' : 'AM';
        const time12 = `${hours12}:${minutes} ${ampm}`;

        const alarmDate = new Date(now);
        alarmDate.setHours(parseInt(hours24), parseInt(minutes), 0, 0);
        const alarmTZTime = new Date(alarmDate.toLocaleString('en-US', { timeZone: alarm.timezone }));
        const prefTZ = clockTimezoneSelect.value;
        const prefTime = new Date(alarmTZTime.toLocaleString('en-US', { timeZone: prefTZ }));
        const prefHours24 = String(prefTime.getHours()).padStart(2, '0');
        const prefMin = String(prefTime.getMinutes()).padStart(2, '0');
        const prefHours12 = prefTime.getHours() % 12 || 12;
        const prefAmpm = prefTime.getHours() >= 12 ? 'PM' : 'AM';
        const prefTimeStr = `${prefHours24}:${prefMin} (${prefHours12}:${prefMin} ${prefAmpm} ${timezoneNames[prefTZ] || prefTZ} Time)`;

        const dayLabels = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
        const recurrenceText = alarm.recurrence && alarm.recurrence.length > 0
            ? alarm.recurrence.map(d => dayLabels[d]).join(', ')
            : 'One-time';

        return `
        <div style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px; ${!alarm.enabled ? 'opacity: 0.6;' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div>
                    <strong>${alarm.time}</strong> <span style="color: #666;">(${time12})</span> ${timezoneNames[alarm.timezone] || alarm.timezone}
                    ${alarm.timezone !== prefTZ ? `<span style="color: #888;">(${prefTimeStr})</span>` : ''}
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        🔁 ${recurrenceText}
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="toggleAlarm('${alarm.id}')" style="padding: 5px 10px; font-size: 12px;">
                        ${alarm.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button class="danger" onclick="deleteAlarm('${alarm.id}')" style="padding: 5px 10px; font-size: 12px;">Delete</button>
                </div>
            </div>
            <div style="display: flex; gap: 5px; align-items: center;">
                <input type="text" id="label-${alarm.id}" value="${alarm.label || ''}" placeholder="Add label..." style="flex: 1; padding: 5px; font-size: 12px;">
                <button onclick="updateLabel('${alarm.id}')" style="padding: 5px 10px; font-size: 12px;">Save Label</button>
            </div>
        </div>`;
    };

    alarmListContainer.innerHTML = `
        <div style="margin-bottom: 15px;">
            <button class="danger" id="clear-all-btn">Clear All Alarms</button>
        </div>
        <h3 style="margin: 15px 0 10px;">✅ Enabled Alarms</h3>
        ${enabledAlarms.length > 0 ? enabledAlarms.map(renderCard).join('') : '<p style="color: #888;">No enabled alarms</p>'}
        <h3 style="margin: 20px 0 10px;">🚫 Disabled Alarms</h3>
        <p style="font-size: 12px; color: #888; margin-bottom: 10px;">You can re-enable or delete alarms from this section</p>
        ${disabledAlarms.length > 0 ? disabledAlarms.map(renderCard).join('') : '<p style="color: #888;">No disabled alarms</p>'}
    `;
    
    // Add clear all handler
    document.getElementById('clear-all-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all alarms?')) {
            alarmService.alarms = [];
            alarmService.saveAlarms();
            renderAlarmDisplay();
        }
    });
}

// Global function for delete button
window.deleteAlarm = function(alarmId) {
    if (confirm('Are you sure you want to delete this alarm?')) {
        const index = alarmService.alarms.findIndex(a => a.id === alarmId);
        if (index !== -1) {
            alarmService.alarms.splice(index, 1);
            alarmService.saveAlarms();
            renderAlarmDisplay();
        }
    }
};

// Global function for updating label
window.updateLabel = function(alarmId) {
    const labelInput = document.getElementById(`label-${alarmId}`);
    const newLabel = labelInput.value.trim();
    
    const alarm = alarmService.alarms.find(a => a.id === alarmId);
    if (alarm) {
        alarm.label = newLabel;
        alarmService.saveAlarms();
        alert('Label updated!');
    }
};

// Global function for toggling alarm enabled/disabled
window.toggleAlarm = function(alarmId) {
    const alarm = alarmService.alarms.find(a => a.id === alarmId);
    if (alarm) {
        alarm.enabled = !alarm.enabled;
        alarmService.saveAlarms();
        renderAlarmDisplay();
    }
};

renderAlarmDisplay();

// Check localStorage availability
if (!storageService.isAvailable()) {
    alert('localStorage is not available. Alarms will not persist across sessions.');
}

console.log('Alarm Clock initialized');

const buildEl = document.getElementById('build-info');
if (buildEl) buildEl.textContent = `Build #${BUILD_NUMBER} • ${BUILD_DATE}`;

