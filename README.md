# TaskFlow — Frontend (React)

## Requirements

- Node.js 18+ or Higher
- npm 9+ or Higher
- Backend must be running on [http://localhost:8080](http://localhost:8080)

## Installation

Install dependencies before running for the first time:
```bash
npm install
```

## Connecting to Backend

The frontend connects to the backend at `http://localhost:8080`.
This is set in `src/config`:
```javascript
const BASE_URL = 'http://localhost:8080';
```

If your backend runs on a different port, update this value.

## Available Commands

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page reloads automatically when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production into the `build` folder.
The build is minified and optimized for best performance.
Ready to deploy on Vercel, Netlify, or any static file server.
