import { useEffect, useState } from 'react';
import './ProgressBar.css';

export function ProgressBar({ percentage }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Delay for animation effect
        requestAnimationFrame(() => {
            setWidth(percentage);
        });
    }, [percentage]);

    return (
        <section className="progress-section">
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${width}%` }}
                />
            </div>
            <p className="progress-text">
                <span className="percentage">{percentage}</span>% of the year has passed
            </p>
        </section>
    );
}
