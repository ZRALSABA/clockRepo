export class AlarmService {
    constructor(storageService, timeService) {
        this.storageService = storageService;
        this.timeService = timeService;
        this.alarms = [];
        this.triggeringAlarms = [];
        this.audioContext = null;
        this.oscillator = null;
        this.checkInterval = null;
        this.onTriggerCallbacks = [];
        this.loadAlarms();
    }

    loadAlarms() {
        const data = this.storageService.load();
        if (data && data.alarms) {
            this.alarms = data.alarms;
        } else {
            this.alarms = [];
            this.saveAlarms();
        }
    }

    saveAlarms() {
        const data = {
            version: 1,
            alarms: this.alarms
        };
        return this.storageService.save(data);
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    onAlarmTriggered(callback) {
        this.onTriggerCallbacks.push(callback);
    }

    notifyTrigger(alarm) {
        this.onTriggerCallbacks.forEach(cb => cb(alarm));
    }

    createAlarm(alarmData) {
        // Validate time format
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(alarmData.time)) {
            throw new Error('Invalid time format. Use HH:MM (00:00 to 23:59)');
        }

        const alarm = {
            id: this.generateId(),
            time: alarmData.time,
            enabled: true,
            label: alarmData.label || '',
            timezone: alarmData.timezone || 'Asia/Amman',
            recurrence: alarmData.recurrence || null,
            snoozeDuration: alarmData.snoozeDuration || 5,
            sound: alarmData.sound || 'beep',
            createdAt: new Date().toISOString(),
            lastTriggered: null
        };

        this.alarms.push(alarm);
        this.saveAlarms();
        return alarm;
    }

    startTriggerDetection() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(() => {
            this.checkTriggers();
        }, 1000);
    }

    stopTriggerDetection() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    checkTriggers() {
        const now = new Date();

        this.alarms.forEach(alarm => {
            if (!alarm.enabled) return;
            
            // Get current time in alarm's timezone
            const timeInTZ = new Date(now.toLocaleString('en-US', { timeZone: alarm.timezone }));
            const currentTimeInAlarmTZ = this.timeService.formatTime(timeInTZ);

            if (alarm.time !== currentTimeInAlarmTZ) return;
            
            // Check if already triggered this minute
            if (alarm.lastTriggered) {
                const lastTrigger = new Date(alarm.lastTriggered);
                const timeSinceLastTrigger = now - lastTrigger;
                // Don't trigger again within 60 seconds
                if (timeSinceLastTrigger < 60000) {
                    return;
                }
            }

            // Check recurrence
            if (!this.timeService.shouldTriggerToday(alarm, now)) {
                return;
            }

            this.triggerAlarm(alarm.id);
        });
    }

    triggerAlarm(alarmId) {
        const alarm = this.alarms.find(a => a.id === alarmId);
        if (!alarm) return;

        alarm.lastTriggered = new Date().toISOString();
        this.saveAlarms();

        const trigger = {
            alarmId: alarm.id,
            triggeredAt: alarm.lastTriggered,
            snoozedCount: 0,
            nextTriggerTime: null
        };

        this.triggeringAlarms.push(trigger);
        this.playAudio(alarm.sound);
        this.notifyTrigger(alarm);
    }

    playAudio(soundType = 'beep') {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.oscillator = this.audioContext.createOscillator();
            
            // Set frequency based on sound type
            const sounds = {
                beep: 800,
                chime: 523.25,
                buzz: 200,
                bell: 1046.50
            };
            
            this.oscillator.frequency.value = sounds[soundType] || 800;
            this.oscillator.connect(this.audioContext.destination);
            this.oscillator.start();
            
            // Beep pattern: 0.5s on, 0.5s off, repeat
            let beepCount = 0;
            const beepInterval = setInterval(() => {
                if (beepCount >= 10 || this.triggeringAlarms.length === 0) {
                    clearInterval(beepInterval);
                    return;
                }
                
                if (beepCount % 2 === 0) {
                    this.oscillator.frequency.value = 800;
                } else {
                    this.oscillator.frequency.value = 0;
                }
                beepCount++;
            }, 500);
        } catch (error) {
            console.error('Failed to play audio:', error);
        }
    }

    stopAudio() {
        if (this.oscillator) {
            try {
                this.oscillator.stop();
                this.oscillator.disconnect();
            } catch (error) {
                // Already stopped
            }
            this.oscillator = null;
        }
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                // Already closed
            }
            this.audioContext = null;
        }
    }

    dismissAlarm(alarmId) {
        const triggerIndex = this.triggeringAlarms.findIndex(t => t.alarmId === alarmId);
        if (triggerIndex === -1) return;

        this.triggeringAlarms.splice(triggerIndex, 1);
        
        // Stop audio if no more triggering alarms
        if (this.triggeringAlarms.length === 0) {
            this.stopAudio();
        }

        // For one-time alarms, disable after trigger
        const alarm = this.alarms.find(a => a.id === alarmId);
        if (alarm && (!alarm.recurrence || alarm.recurrence.length === 0)) {
            alarm.enabled = false;
            this.saveAlarms();
        }
    }
}
