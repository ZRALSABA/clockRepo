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

        this.container.innerHTML = `
            <h2>⏰ Alarm!</h2>
            <p style="font-size: 24px; margin: 20px 0;">${this.currentAlarm.time}</p>
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
