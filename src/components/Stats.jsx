import './Stats.css';

export function Stats({ daysPassed, daysRemaining }) {
    return (
        <section className="stats">
            <div className="stat">
                <span className="stat-number">{daysPassed}</span>
                <span className="stat-label">days passed</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
                <span className="stat-number">{daysRemaining}</span>
                <span className="stat-label">days remaining</span>
            </div>
        </section>
    );
}
