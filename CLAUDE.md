# CLAUDE.md

Project notes for Claude (or any future contributor) working on this repo.

## What this is

A beginner-friendly weather web app. User types a city, sees the current
weather. Built by Aram as his first coding project, with no prior coding
experience — keep explanations simple and changes incremental.

## Stack

- **Frontend**: plain HTML/CSS/JS in the repo root (`index.html`, `css/`,
  `js/`). No framework, no build step, on purpose — keep it light.
- **Backend**: one Netlify serverless function, `netlify/functions/weather.js`.
  It is a secure proxy to WeatherAPI.com — the only place `WEATHER_API_KEY`
  is read. The browser never sees the real key.
- **Weather data**: [WeatherAPI.com](https://www.weatherapi.com/), endpoint
  `GET https://api.weatherapi.com/v1/forecast.json?key=...&q=<city>&days=3`
  (this single endpoint returns both current weather and the forecast).
  Free plan caps `days` at 3 — `MAX_DAYS` in `netlify/functions/weather.js`
  enforces that.
- **Deployment**: Netlify. `netlify.toml` maps `/api/*` to the function so
  the frontend calls the clean path `/api/weather?city=...`.

## Secrets

- The real key lives in `WEATHER_API_KEY`:
  - Locally: in `.env` (git-ignored, never committed).
  - In production: set as an environment variable in the Netlify dashboard
    (Site settings → Environment variables), not in any file in the repo.
- `.env.example` documents the variable name only (no real value) and is
  safe to commit.
- **Never read, print, or commit the contents of `.env`.** `.claude/settings.json`
  already denies Claude Code from reading it — keep that in place.

## Current scope (intentionally light)

- Current weather + 3-day forecast are implemented.
- Yerevan loads by default; the search field works for any other city.
- Light/dark mode toggle is implemented (CSS variables in `css/style.css`,
  toggle logic in `js/app.js`, choice saved in `localStorage`).
- No UI animations yet.

## Planned next steps (do only when asked)

- Add small UI animations/transitions.

## Conventions

- Keep the frontend dependency-free unless there's a strong reason to add a
  build step.
- Keep the serverless function as the only place that touches the API key.
- Prefer small, explainable diffs — the project owner is learning to code
  alongside this project.
