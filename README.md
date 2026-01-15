# TimeLeft.life

A minimal, elegant visualization of time passing through the year. Watch as each day fills in on an interactive grid, with a live timer counting every moment.

## Features

- **Year Progress Bar** - Visual percentage of the year completed
- **Day Statistics** - Days passed vs days remaining
- **Live Timer** - Real-time clock with millisecond precision
- **Days Grid** - 365/366 dots representing each day of the year
- **Dark Theme** - Easy on the eyes, beautiful design
- **Responsive** - Works on all screen sizes
- **Accessible** - Respects reduced motion preferences

## Tech Stack

- React 19
- Vite 7
- CSS Variables for theming

## Project Structure

```
src/
├── features/
│   ├── progress/          # Year progress components
│   │   ├── components/
│   │   │   ├── DaysGrid.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── Stats.jsx
│   │   └── hooks/
│   │       └── useTimeStats.js
│   └── timer/             # Live timer feature
│       ├── components/
│       │   └── LiveTimer.jsx
│       └── hooks/
│           └── useLiveTimer.js
├── shared/
│   ├── styles/            # Global styles & variables
│   └── utils/             # Date utilities
├── App.jsx
└── main.jsx
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

MIT
