export class AlarmTrigger {
    constructor(containerElement) {
        this.container = containerElement;
        this.onDismissCallbacks = [];
        this.onSnoozeCallbacks = [];
        this.currentAlarm = null;
    }

    show(alarm) {
        this.currentAlarm = alarm;
        this.render();
    }

    hide() {
        this.currentAlarm = null;
        this.container.innerHTML = '';
    }

    render() {
        if (!this.currentAlarm) return;

        const timezoneNames = {
            'America/New_York': 'Eastern Time',
            'America/Chicago': 'Central Time',
            'America/Denver': 'Mountain Time',
            'America/Los_Angeles': 'Pacific Time',
            'America/Phoenix': 'Arizona Time',
            'America/Anchorage': 'Alaska Time',
            'Pacific/Honolulu': 'Hawaii Time',
            'Asia/Amman': 'Jordan Time',
            'Europe/London': 'London Time',
            'Europe/Paris': 'Paris Time',
            'Asia/Tokyo': 'Tokyo Time',
            'Asia/Shanghai': 'Shanghai Time',
            'Asia/Dubai': 'Dubai Time',
            'Australia/Sydney': 'Sydney Time'
        };

        const timezoneName = timezoneNames[this.currentAlarm.timezone] || this.currentAlarm.timezone;

        this.container.innerHTML = `
            <h2>⏰ Alarm!</h2>
            <p style="font-size: 24px; margin: 20px 0;">${this.currentAlarm.time}</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">${timezoneName}</p>
            <p style="margin-bottom: 20px;">${this.currentAlarm.label || 'Alarm'}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="dismiss-btn">Dismiss</button>
            </div>
        `;

        const dismissBtn = this.container.querySelector('#dismiss-btn');
        dismissBtn.addEventListener('click', () => {
            this.onDismissCallbacks.forEach(cb => cb(this.currentAlarm.id));
            this.hide();
        });
    }

    onDismiss(callback) {
        this.onDismissCallbacks.push(callback);
    }

    onSnooze(callback) {
        this.onSnoozeCallbacks.push(callback);
    }
}
