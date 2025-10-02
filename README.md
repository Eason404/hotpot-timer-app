# 🔥 火锅计时器 Hotpot Timer# 🍲 火锅计时器 (Hotpot Timer)



[![Deploy](https://github.com/Eason404/hotpot-timer-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/Eason404/hotpot-timer-app/actions/workflows/deploy.yml)A mobile-first web app for timing hotpot ingredients with a beautiful card-based interface.



> 专为火锅爱好者设计的移动端计时器应用 | Mobile-first timer app designed for hotpot lovers![Tech Stack](https://img.shields.io/badge/React-18+-blue?logo=react)

![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)

🌐 **Live Demo**: [https://eason404.github.io/hotpot-timer-app/](https://eason404.github.io/hotpot-timer-app/)![Vite](https://img.shields.io/badge/Vite-7+-646CFF?logo=vite)

![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?logo=tailwind-css)

## ✨ 核心功能 Features![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)



- 🛒 **智能备菜** - 预选食材，自定义时间## ✨ Features

- 🔥 **一键开煮** - 点击即开始计时

- ⏰ **精准计时** - 每种食材最佳烹饪时间### 🍽️ **Smart Ingredient Cards**

- 🔊 **多重提醒** - 声音 + 震动 + 通知- **22 common hotpot ingredients** with recommended cooking times

- 📱 **移动优先** - 响应式设计，完美适配手机- **Category filtering**: 肉类, 内脏/爽脆, 丸滑/加工, 海鲜, 蔬菜菌菇, 豆制品/主食, 其他

- **Search functionality** to quickly find ingredients

## 🚀 使用流程 Workflow- **Time adjustment** (±60s) before starting timers



1. **备菜Tab** → 选择今天要吃的食材### ⏱️ **Advanced Timer Management**

2. **调整时间** → 根据个人喜好微调烹饪时间  - **Multiple concurrent timers** with progress tracking

3. **开煮Tab** → 边下锅边点击开始计时- **Pause/resume** functionality 

4. **完成提醒** → 声音震动提醒起锅- **Quick adjustments**: +30s, +60s buttons

- **Visual progress bars** showing cooking progress

## 🛠️ 技术栈 Tech Stack- **Bottom dock** showing all active and completed timers



- **React 19** + **TypeScript** + **Vite 7**### 🔔 **Multi-Modal Alerts**

- **Tailwind CSS** + **shadcn/ui** + **Framer Motion**- **🔊 Audio alerts** using WebAudio API (customizable beep)

- **GitHub Pages** 自动部署- **📳 Vibration** support for mobile devices

- **🔔 Browser notifications** (with permission)

## 🏃‍♂️ 本地开发 Development- **Settings toggles** for sound and vibration



```bash### 💾 **Persistent State**

# 克隆项目- **localStorage integration** - timers survive page refresh

git clone https://github.com/Eason404/hotpot-timer-app.git- **Settings persistence** (sound/vibration preferences)

cd hotpot-timer-app- **Auto-recovery** of running timers after browser restart



# 安装依赖### 📱 **Mobile-First Design**

npm install- **Responsive grid layout** optimized for mobile devices

- **Touch-friendly controls** with adequate spacing

# 启动开发服务器- **Smooth animations** using Framer Motion

npm run dev- **Clean UI** with shadcn/ui components

```

## 🚀 Quick Start

## 📱 食材库 Ingredients Database

```bash

包含常见火锅食材的最佳烹饪时间：# Install dependencies

- 肉类：肥牛卷、羊肉片等npm install

- 内脏：毛肚、鸭肠、黄喉等  

- 丸滑：虾滑、鱼丸、牛筋丸等# Start development server

- 海鲜：鲜虾、鱿鱼圈等npm run dev

- 蔬菜：娃娃菜、金针菇等

- 豆制品：豆腐、千张等# Build for production

- 主食：粉丝、年糕等npm run build



---# Preview production build

npm run preview

## 🌟 English```



A smart hotpot timer app with prep list and customizable cooking times.## 🛠️ Tech Stack



### Key Features- **Framework**: React 19+ with TypeScript

- **Smart Prep Mode**: Pre-select ingredients and customize cooking times- **Build Tool**: Vite 7+

- **One-Click Cooking**: Tap to start timing while adding ingredients- **Styling**: Tailwind CSS v3 (avoiding v4 PostCSS changes)

- **Multi-alert System**: Sound + vibration + browser notifications- **UI Components**: shadcn/ui (button, card, badge, input, slider)

- **Mobile-first Design**: Perfect for kitchen use- **Animations**: Framer Motion

- **Icons**: Lucide React

### Quick Start- **Audio**: Web Audio API

Visit [Live Demo](https://eason404.github.io/hotpot-timer-app/) or run locally with `npm run dev`- **Notifications**: Notification API + Vibration API



Built with modern web technologies for the best hotpot experience! 🍲## 📁 Project Structure

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
