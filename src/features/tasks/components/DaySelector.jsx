import './DaySelector.css';

export function DaySelector({ selectedDate, onChange }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = selectedDate.toDateString() === today.toDateString();

    const formatDate = (date) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const goToPrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        onChange(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        if (newDate <= today) {
            onChange(newDate);
        }
    };

    const goToToday = () => {
        onChange(new Date(today));
    };

    const canGoNext = new Date(selectedDate).setDate(selectedDate.getDate() + 1) <= today.getTime();

    return (
        <div className="day-selector">
            <button
                className="day-selector-btn"
                onClick={goToPrevDay}
                title="Previous day"
            >
                ←
            </button>

            <div className="day-selector-date">
                <span className="day-selector-label">
                    {isToday ? 'Today' : formatDate(selectedDate)}
                </span>
                {!isToday && (
                    <button className="day-selector-today" onClick={goToToday}>
                        Go to today
                    </button>
                )}
            </div>

            <button
                className="day-selector-btn"
                onClick={goToNextDay}
                disabled={!canGoNext}
                title="Next day"
            >
                →
            </button>
        </div>
    );
}
