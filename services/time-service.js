export class TimeService {
    constructor() {
        this.intervalId = null;
    }

    start(callback) {
        if (this.intervalId) {
            this.stop();
        }
        this.intervalId = setInterval(() => {
            callback(this.getCurrentTime());
        }, 1000);
        callback(this.getCurrentTime());
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getCurrentTime() {
        return new Date();
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    shouldTriggerToday(alarm, currentDate) {
        if (!alarm.recurrence || alarm.recurrence.length === 0) {
            return true;
        }

        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const currentDay = dayNames[currentDate.getDay()];
        return alarm.recurrence.includes(currentDay);
    }
}
