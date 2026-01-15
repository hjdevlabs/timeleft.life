import { useLiveTimer } from '../hooks/useLiveTimer';
import './LiveTimer.css';

export function LiveTimer() {
    const { hours, minutes, seconds, ms } = useLiveTimer();

    return (
        <section className="live-timer-section">
            <div className="live-timer">
                <span className="timer-segment">
                    <span className="timer-value">{hours}</span>
                    <span className="timer-label">h</span>
                </span>
                <span className="timer-colon">:</span>
                <span className="timer-segment">
                    <span className="timer-value">{minutes}</span>
                    <span className="timer-label">m</span>
                </span>
                <span className="timer-colon">:</span>
                <span className="timer-segment">
                    <span className="timer-value">{seconds}</span>
                    <span className="timer-label">s</span>
                </span>
                <span className="timer-segment timer-ms">
                    <span className="timer-colon">.</span>
                    <span className="timer-value">{ms}</span>
                </span>
            </div>
            <p className="timer-caption">time elapsed today</p>
        </section>
    );
}
