import { useTimeStats } from './hooks/useTimeStats';
import { ProgressBar } from './components/ProgressBar';
import { Stats } from './components/Stats';
import { LiveTimer } from './components/LiveTimer';
import { DaysGrid } from './components/DaysGrid';
import './App.css';

function App() {
    const { year, totalDays, daysPassed, daysRemaining, percentage } = useTimeStats();

    return (
        <main>
            <header>
                <h1 className="year">{year}</h1>
            </header>

            <ProgressBar percentage={percentage} />

            <Stats daysPassed={daysPassed} daysRemaining={daysRemaining} />

            <LiveTimer />

            <DaysGrid totalDays={totalDays} daysPassed={daysPassed} />

            <footer>
                <p className="tagline">A simple reminder that time moves.</p>
            </footer>
        </main>
    );
}

export default App;
