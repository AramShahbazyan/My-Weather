# Setup steps (do these once)

Follow these in order. Nothing here requires coding — just following steps.

## 1. Get a free WeatherAPI.com key

1. Go to https://www.weatherapi.com/ and sign up (free plan is enough).
2. After signing in, copy your **API key** from the dashboard.

## 2. Add two files Claude could not create for you (security guardrail)

These were sent to you separately in the chat, because writing directly to
`.env` or `.claude/` from here is blocked as a safety measure:

- **`.env`** — goes directly inside the `weather` folder. Open the file
  named `env-file-for-weather-app.txt` that was sent to you, copy its
  content, then:
  1. Open Notepad, paste the content.
  2. Replace the empty value after `WEATHER_API_KEY=` with your real key
     from step 1 (no quotes, no spaces), e.g. `WEATHER_API_KEY=abc123`.
  3. File → Save As → in "File name" type `".env"` (with the quotes, so
     Notepad doesn't add `.txt`) → Save type "All Files" → save it directly
     inside your `weather` folder.

- **`.claude/settings.json`** — inside the `weather` folder, create a new
  folder named `.claude`, then inside it save the file
  `claude-settings-for-weather-app.json` as `settings.json` (same content,
  just renamed). This tells Claude Code to never read your `.env` file.

## 3. Push the project to GitHub

Open a terminal (or Git Bash) inside the `weather` folder and run:

```
git add .
git commit -m "Initial weather app"
git push
```

(If `git push` asks about a remote/branch the first time, follow what it
tells you, or say the word and I'll walk you through it.)

Note: `.env` will NOT be pushed — that's intentional, it's git-ignored so
your key stays private.

## 4. Deploy on Netlify

1. Go to https://app.netlify.com/ and log in (or sign up).
2. **Add new site → Import an existing project → connect to GitHub** →
   pick your `weather` repository.
3. Build settings: leave "Build command" empty, "Publish directory" as `.`
   (the defaults from `netlify.toml` should already handle this).
4. Before deploying (or right after, in **Site settings → Environment
   variables**), add:
   - Key: `WEATHER_API_KEY`
   - Value: your real key from step 1
5. Deploy the site.

## 5. Test it

Open the Netlify site URL Netlify gives you, type a city (e.g. `Yerevan`),
and press Search. You should see the current weather.

If something doesn't work, copy the error message (or a screenshot) here
and we'll fix it together.

## What's next (later, not now)

- Add a forecast (multi-day) view.
- Add a light/dark mode toggle.
- Add small UI animations.
