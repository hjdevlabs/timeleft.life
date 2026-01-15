import { useMemo } from 'react';
import './DaysGrid.css';

export function DaysGrid({ totalDays, daysPassed }) {
    const dots = useMemo(() => {
        return Array.from({ length: totalDays }, (_, i) => {
            let className = 'day-dot';
            if (i < daysPassed - 1) {
                className += ' filled';
            } else if (i === daysPassed - 1) {
                className += ' today';
            }
            return <div key={i} className={className} />;
        });
    }, [totalDays, daysPassed]);

    return (
        <section className="grid-section">
            <div className="days-grid">{dots}</div>
        </section>
    );
}
