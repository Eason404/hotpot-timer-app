# Copilot Project Spec — Hotpot Timer

**Tech:** Vite + React + TS + Tailwind v3 + shadcn/ui. Use framer-motion and lucide-react. Alias '@' -> './src'.

**UI:** mobile-first card grid; bottom dock with timer chips; minimal, rounded corners (2xl), soft shadows, adequate spacing.

## Rules:
- Prefer shadcn/ui components (button, card, badge, input, slider).
- Keep Tailwind classes concise; no long utility chains if a component prop exists.
- For timers, persist to localStorage; avoid external state libs.
- Sound: WebAudio beep; Reminders: optional Notification API; Vibration if supported.
- Avoid Tailwind v4 configs; `postcss.config.js` uses `tailwindcss` plugin.

## Features Implemented:
- ✅ Ingredient cards with recommended cooking times
- ✅ Search & category filtering
- ✅ Timer management with bottom dock
- ✅ Pause/resume, +30s/+60s adjustments
- ✅ Audio alerts (WebAudio beep)
- ✅ Vibration support
- ✅ Browser notifications (optional)
- ✅ localStorage persistence for timers and settings
- ✅ Mobile-first responsive design
- ✅ Clean UI with Tailwind v3 + shadcn/ui