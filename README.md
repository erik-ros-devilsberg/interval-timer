# Interval Timer

A minimalist interval timer that runs in the browser and installs as an app.

**Use it:** [interval-timer.devilsberg.com](https://interval-timer.devilsberg.com)

By default it runs five 1-minute intervals. A soft 3-2-1 beep counts you in before the start and before every new interval, so you can keep your eyes off the screen.

## Features

- Gentle audible 3-2-1 countdown before starting and before each interval change, with a closing chime at the end
- Digital clock, or an analog clock whose disc shrinks back to twelve like a kitchen timer
- Settings via the gear icon (top right):
  - background color
  - clock color
  - clock type (digital or analog)
  - interval length (10 seconds to 60 minutes)
  - number of intervals (1 to 99)
- Settings are saved in your browser
- Installable PWA that works offline
- Keeps the screen awake while running
- Respects reduced-motion preferences

### Keyboard

| Key | Action |
| --- | --- |
| `Space` | Start / pause |
| `R` | Reset |
| `Esc` | Close settings |

## Development

Requires Node.js 20 or newer.

```sh
npm install
npm run dev       # start dev server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run icons     # regenerate PWA icons from public/favicon.svg
```

### Project structure

```
src/
  App.vue                     main screen: clock, interval dots, controls
  useTimer.js                 timer state machine and countdown triggers
  audio.js                    Web Audio tones (no sound files)
  settings.js                 persisted settings and limits
  format.js                   time formatting
  components/
    AnalogClock.vue           shrinking-disc clock face
    SettingsPanel.vue         settings overlay
```

## Self-hosting

`npm run build` outputs a static site in `dist/`. Serve it from any static host over HTTPS (required for the service worker and screen wake lock). No server-side code or environment variables are needed.

## Built with

- [Vue 3](https://vuejs.org) and [Vite](https://vite.dev)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app)
- [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) via Fontsource

## Support

If you enjoy the timer, you can support it on [Ko-fi](https://ko-fi.com/devilsberg). Thanks for appreciating!

## License

[MIT](LICENSE) © Erik Ros
