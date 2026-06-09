# World Clock Dashboard

A real-time world clock dashboard built with HTML5, CSS3, and vanilla JavaScript.

## Features

- Single master `setInterval` tick loop updating all city cards simultaneously.
- Native `Intl.DateTimeFormat` timezone rendering — no third-party libraries.
- 14 predefined global cities with label, region, and IANA timezone.
- Day/night visual states: amber glow for daytime (6 AM–6 PM), navy twilight for nighttime.
- Relative offset badges (e.g. "+4.5h ahead", "9h behind") computed from `Date.getTimezoneOffset` and `Intl` offset parsing.
- 12h/24h toggle with smooth track switch animation.
- Add/remove cities dynamically; duplicate detection with overlay alert.
- All preferences and active city list persisted via `localStorage`.

## Run it

Open `index.html` in any modern browser.
