# 🍲 火锅计时器 (Hotpot Timer)

A mobile-first web app for timing hotpot ingredients with a beautiful card-based interface.

![Tech Stack](https://img.shields.io/badge/React-18+-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7+-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)

## ✨ Features

### 🍽️ **Smart Ingredient Cards**
- **22 common hotpot ingredients** with recommended cooking times
- **Category filtering**: 肉类, 内脏/爽脆, 丸滑/加工, 海鲜, 蔬菜菌菇, 豆制品/主食, 其他
- **Search functionality** to quickly find ingredients
- **Time adjustment** (±60s) before starting timers

### ⏱️ **Advanced Timer Management**
- **Multiple concurrent timers** with progress tracking
- **Pause/resume** functionality 
- **Quick adjustments**: +30s, +60s buttons
- **Visual progress bars** showing cooking progress
- **Bottom dock** showing all active and completed timers

### 🔔 **Multi-Modal Alerts**
- **🔊 Audio alerts** using WebAudio API (customizable beep)
- **📳 Vibration** support for mobile devices
- **🔔 Browser notifications** (with permission)
- **Settings toggles** for sound and vibration

### 💾 **Persistent State**
- **localStorage integration** - timers survive page refresh
- **Settings persistence** (sound/vibration preferences)
- **Auto-recovery** of running timers after browser restart

### 📱 **Mobile-First Design**
- **Responsive grid layout** optimized for mobile devices
- **Touch-friendly controls** with adequate spacing
- **Smooth animations** using Framer Motion
- **Clean UI** with shadcn/ui components

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite 7+
- **Styling**: Tailwind CSS v3 (avoiding v4 PostCSS changes)
- **UI Components**: shadcn/ui (button, card, badge, input, slider)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Audio**: Web Audio API
- **Notifications**: Notification API + Vibration API

## 📁 Project Structure

```
src/
├── App.tsx              # Main hotpot timer implementation
├── main.tsx            # React app entry point
├── index.css           # Tailwind directives + CSS variables
├── components/ui/      # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   └── slider.tsx
└── lib/
    └── utils.ts        # Utility functions

docs/
└── copilot-project-spec.md  # Project specification for AI assistance
```

## 🎯 Usage Guide

### Starting Timers
1. **Browse ingredients** by category or use search
2. **Click any card** to start with recommended time
3. **Use ± button** to adjust time before starting
4. **Quick start** with common ingredients in the top section

### Managing Timers
- **Pause/Resume**: Click the play/pause button
- **Add Time**: Use +30s or +60s buttons for extra cooking
- **Remove**: Click the X button to cancel a timer
- **Clear Done**: Remove all completed timers at once

### Settings
- **🔊 Sound Toggle**: Enable/disable audio alerts
- **📳 Vibration Toggle**: Enable/disable vibration alerts  
- **🔔 Notifications**: Click settings icon to enable browser notifications

## 🔧 Configuration

### Tailwind CSS v3
The project uses Tailwind CSS v3 with shadcn/ui integration:
- PostCSS configuration in `postcss.config.js`
- Tailwind config with CSS variables in `tailwind.config.js`
- Dark mode support with class strategy

### Path Aliases
- `@/*` → `./src/*` (configured in both Vite and TypeScript)

### shadcn/ui Setup
```json
{
  "style": "new-york",
  "baseColor": "neutral", 
  "cssVariables": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 🍲 Ingredient Database

The app includes 22 carefully curated ingredients with authentic cooking times:

| Category | Examples | Time Range |
|----------|----------|------------|
| 肉类 | 肥牛卷, 羊肉片 | 45s - 60s |
| 内脏/爽脆 | 毛肚, 鸭肠, 黄喉 | 15s - 120s |
| 丸滑/加工 | 虾滑, 牛筋丸, 鱼丸 | 3-7 minutes |
| 海鲜 | 鲜虾, 蟹棒 | 2-3 minutes |
| 蔬菜菌菇 | 金针菇, 菠菜, 海带结 | 1-5 minutes |
| 豆制品/主食 | 豆腐, 粉丝, 宽粉 | 3-5 minutes |
| 其他 | 玉米段 | 8 minutes |

## 🚀 Future Enhancements (Step 6)

Potential PWA features:
- **Offline support** with service worker
- **App installation** with web app manifest  
- **Background sync** for timer persistence
- **Push notifications** for timer completion

## 📝 Development Notes

- Uses React 19+ with modern hooks and patterns
- TypeScript strict mode enabled
- ESLint configured for React + TypeScript
- Mobile-first responsive design principles
- localStorage for state persistence
- WebAudio for cross-platform sound support

## 🤝 Contributing

This project follows modern React patterns and Tailwind best practices. When contributing:
- Use shadcn/ui components when possible
- Keep Tailwind classes concise
- Maintain mobile-first responsive design
- Test timer accuracy and persistence features

---

Built with ❤️ for hotpot lovers everywhere 🍲
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
