export class Clock {
    constructor(containerElement) {
        this.container = containerElement;
        this.timeService = null;
        this.timezone = 'America/New_York'; // Default timezone
    }

    start(timeService, timezone = 'America/New_York') {
        this.timeService = timeService;
        this.timezone = timezone;
        this.timeService.start((currentTime) => {
            this.render(currentTime);
        });
    }

    stop() {
        if (this.timeService) {
            this.timeService.stop();
        }
    }

    setTimezone(timezone) {
        this.timezone = timezone;
    }

    render(currentTime) {
        // Convert to selected timezone
        const timeInTZ = new Date(currentTime.toLocaleString('en-US', { timeZone: this.timezone }));
        const hours = String(timeInTZ.getHours()).padStart(2, '0');
        const minutes = String(timeInTZ.getMinutes()).padStart(2, '0');
        const seconds = String(timeInTZ.getSeconds()).padStart(2, '0');
        
        // Convert to 12-hour format
        const hours12 = timeInTZ.getHours() % 12 || 12;
        const ampm = timeInTZ.getHours() >= 12 ? 'PM' : 'AM';
        const time12 = `${hours12}:${minutes} ${ampm}`;
        
        this.container.textContent = `${hours}:${minutes}:${seconds} (${time12})`;
    }

    getTime() {
        return this.timeService ? this.timeService.getCurrentTime() : new Date();
    }
}
