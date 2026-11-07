# Raspberry Pi Monitor

A Next.js dashboard for live CPU, memory, temperature and process information from the machine running the server. Intended for Raspberry Pi OS/Linux; CPU and memory work on other Node platforms, while temperature requires `vcgencmd` and the process list requires GNU `ps`.

## Local setup

Use Node.js 24 LTS (`nvm use`):

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3050. For a production build, run `npm run build` followed by `npm start`. Both commands bind to loopback by default.

CPU percentages measure counter differences between samples, rather than lifetime averages. The first sample may be zero before enough time has elapsed. Server-side samples are reused briefly, but API responses use `private, no-store` to keep system details out of shared/browser caches.

## Remote access

For remote access, put the loopback server behind an HTTPS reverse proxy and configure both variables in `.env.local`:

```dotenv
MONITOR_USERNAME=your-monitor-user
MONITOR_PASSWORD=choose-a-long-unique-password
```

HTTP Basic authentication protects the dashboard and both APIs; your browser will prompt for credentials. A partially configured username/password denies access. With neither variable set the local dashboard is unauthenticated. Basic authentication must use HTTPS outside the machine. To deliberately expose the Node server on your LAN, run `npx next start -p 3050 -H 0.0.0.0` after configuring authentication and network access controls.

## Verification

```sh
npm test
npm run lint
npm run build
```

Tests cover CPU deltas, counter resets/new cores and credential validation. GitHub Actions repeats these checks for every push and pull request. Actual Raspberry Pi temperature/process behavior still needs verification on the target hardware.
