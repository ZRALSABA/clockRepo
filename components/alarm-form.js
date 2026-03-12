export class AlarmForm {
    constructor(containerElement) {
        this.container = containerElement;
        this.onSubmitCallbacks = [];
        this.onCancelCallbacks = [];
        this.currentAlarm = null;
        this.render();
    }

    render() {
        // Get current time in different timezones for display
        const now = new Date();
        const getTimeInTZ = (tz) => {
            try {
                const time = new Date(now.toLocaleString('en-US', { timeZone: tz }));
                const hours24 = String(time.getHours()).padStart(2, '0');
                const minutes = String(time.getMinutes()).padStart(2, '0');
                const hours12 = time.getHours() % 12 || 12;
                const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
                return ` (${hours24}:${minutes} - ${hours12}:${minutes} ${ampm})`;
            } catch {
                return '';
            }
        };

        this.container.innerHTML = `
            <form id="alarm-form">
                <div class="form-group">
                    <label for="alarm-timezone">Timezone</label>
                    <select id="alarm-timezone">
                        <option value="America/New_York">Eastern Time (ET)${getTimeInTZ('America/New_York')}</option>
                        <option value="America/Chicago">Central Time (CT)${getTimeInTZ('America/Chicago')}</option>
                        <option value="America/Denver">Mountain Time (MT)${getTimeInTZ('America/Denver')}</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)${getTimeInTZ('America/Los_Angeles')}</option>
                        <option value="America/Phoenix">Arizona Time (MST)${getTimeInTZ('America/Phoenix')}</option>
                        <option value="America/Anchorage">Alaska Time (AKT)${getTimeInTZ('America/Anchorage')}</option>
                        <option value="Pacific/Honolulu">Hawaii Time (HST)${getTimeInTZ('Pacific/Honolulu')}</option>
                        <option value="Asia/Amman">Jordan Time (EET)${getTimeInTZ('Asia/Amman')}</option>
                        <option value="Europe/London">London (GMT/BST)${getTimeInTZ('Europe/London')}</option>
                        <option value="Europe/Paris">Paris (CET/CEST)${getTimeInTZ('Europe/Paris')}</option>
                        <option value="Asia/Tokyo">Tokyo (JST)${getTimeInTZ('Asia/Tokyo')}</option>
                        <option value="Asia/Shanghai">Shanghai (CST)${getTimeInTZ('Asia/Shanghai')}</option>
                        <option value="Asia/Dubai">Dubai (GST)${getTimeInTZ('Asia/Dubai')}</option>
                        <option value="Australia/Sydney">Sydney (AEDT/AEST)${getTimeInTZ('Australia/Sydney')}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="alarm-time">Time</label>
                    <input type="time" id="alarm-time" required style="font-size: 16px;">
                    <div class="error" id="time-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="alarm-label">Label (optional)</label>
                    <input type="text" id="alarm-label" maxlength="50" placeholder="e.g., Wake up">
                </div>
                
                <div class="form-group">
                    <button type="submit">Create Alarm</button>
                    <button type="button" class="secondary" id="cancel-btn" style="display:none;">Cancel</button>
                </div>
            </form>
        `;

        const form = this.container.querySelector('#alarm-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        const cancelBtn = this.container.querySelector('#cancel-btn');
        cancelBtn.addEventListener('click', () => {
            this.hide();
            this.onCancelCallbacks.forEach(cb => cb());
        });
    }

    show(alarm = null) {
        this.currentAlarm = alarm;
        const timeInput = this.container.querySelector('#alarm-time');
        const labelInput = this.container.querySelector('#alarm-label');
        const timezoneSelect = this.container.querySelector('#alarm-timezone');
        const cancelBtn = this.container.querySelector('#cancel-btn');

        if (alarm) {
            timeInput.value = alarm.time;
            labelInput.value = alarm.label || '';
            timezoneSelect.value = alarm.timezone || 'Asia/Amman';
            cancelBtn.style.display = 'inline-block';
        } else {
            timeInput.value = '';
            labelInput.value = '';
            timezoneSelect.value = 'Asia/Amman';
            cancelBtn.style.display = 'none';
        }

        this.clearErrors();
    }

    hide() {
        this.currentAlarm = null;
        this.container.querySelector('#alarm-time').value = '';
        this.container.querySelector('#alarm-label').value = '';
        this.clearErrors();
    }

    handleSubmit() {
        const timeInput = this.container.querySelector('#alarm-time');
        const labelInput = this.container.querySelector('#alarm-label');
        const timezoneSelect = this.container.querySelector('#alarm-timezone');

        const validation = this.validate();
        if (!validation.valid) {
            this.showErrors(validation.errors);
            return;
        }

        const alarmData = {
            time: timeInput.value,
            label: labelInput.value.trim(),
            timezone: timezoneSelect.value
        };

        if (this.currentAlarm) {
            alarmData.id = this.currentAlarm.id;
        }

        this.onSubmitCallbacks.forEach(cb => cb(alarmData));
        this.hide();
    }

    validate() {
        const timeInput = this.container.querySelector('#alarm-time');
        const errors = [];

        if (!timeInput.value) {
            errors.push('Time is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    showErrors(errors) {
        const errorDiv = this.container.querySelector('#time-error');
        errorDiv.textContent = errors.join(', ');
    }

    clearErrors() {
        const errorDiv = this.container.querySelector('#time-error');
        if (errorDiv) {
            errorDiv.textContent = '';
        }
    }

    onSubmit(callback) {
        this.onSubmitCallbacks.push(callback);
    }

    onCancel(callback) {
        this.onCancelCallbacks.push(callback);
    }
}
