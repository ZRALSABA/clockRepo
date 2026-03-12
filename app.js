import { StorageService } from './services/storage.js';
import { TimeService } from './services/time-service.js';
import { AlarmService } from './services/alarm-service.js';
import { Clock } from './components/clock.js';
import { AlarmForm } from './components/alarm-form.js';
import { AlarmTrigger } from './components/alarm-trigger.js';

// Initialize services
const storageService = new StorageService();
const timeService = new TimeService();
const alarmService = new AlarmService(storageService, timeService);

// Initialize Clock component with timezone selector
const clockDisplay = document.getElementById('clock-display');
const clockTimezoneSelect = document.getElementById('clock-timezone');
const clock = new Clock(clockDisplay);

// Set default to Jordan timezone
clockTimezoneSelect.value = 'Asia/Amman';
clock.start(timeService, 'Asia/Amman');

// Handle clock timezone changes
clockTimezoneSelect.addEventListener('change', (e) => {
    clock.setTimezone(e.target.value);
});

// Initialize AlarmForm component
const alarmFormContainer = document.getElementById('alarm-form-container');
const alarmForm = new AlarmForm(alarmFormContainer);

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
    const alarms = alarmService.alarms;
    
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
    
    alarmListContainer.innerHTML = `
        <div style="margin-bottom: 15px;">
            <button class="danger" id="clear-all-btn">Clear All Alarms</button>
        </div>
        ${alarms.map(alarm => {
            // Convert 24-hour time to 12-hour format
            const [hours24, minutes] = alarm.time.split(':');
            const hours12 = parseInt(hours24) % 12 || 12;
            const ampm = parseInt(hours24) >= 12 ? 'PM' : 'AM';
            const time12 = `${hours12}:${minutes} ${ampm}`;
            
            return `
            <div style="padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <strong>${alarm.time}</strong> <span style="color: #666;">(${time12})</span> ${timezoneNames[alarm.timezone] || alarm.timezone}
                        <span style="color: ${alarm.enabled ? 'green' : 'gray'}">
                            ${alarm.enabled ? '✓ Enabled' : '✗ Disabled'}
                        </span>
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
            </div>
        `;}).join('')}
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

