# Portfolio

My personal site, built as a Linux i3-style tiling desktop — a terminal, a file
manager, a browser and a couple of games, tiled in resizable panes.

Live at [gauravahuja.vercel.app](https://gauravahuja.vercel.app)

## Features

- 🪟 Tiling window manager layout (dockview) with draggable, resizable panes
- 💻 Terminal with a real command set — `ls`, `cd`, `cat`, `theme`, `contact`, and a few hidden ones
- 📁 File manager — the site's content lives here as folders and READMEs
- 🎨 Four themes (Everforest, Catppuccin Mocha, Gruvbox, Tokyo Night) with wallpapers
- 🎮 Built-in games (Snake, Diamond Hunt)
- 🐾 A pet that wanders along the bottom of the screen
- 📱 Responsive

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui

| | |
|---|---|
| [dockview](https://dockview.dev) | the tiling pane layout |
| [zustand](https://github.com/pmndrs/zustand) | app / theme / wallpaper state |
| [chatcn](https://www.chatcn.me) | terminal and file-manager primitives |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The lock screen password is
shown on screen.

### Environment

Both are optional — without them the contact form is disabled and analytics
are skipped.

```bash
NEXT_PUBLIC_WEB3FORMS_KEY=...      # https://web3forms.com
NEXT_PUBLIC_HCAPTCHA_SITEKEY=...   # https://hcaptcha.com
NEXT_PUBLIC_POSTHOG_KEY=...        # optional analytics
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Build

```bash
pnpm build
pnpm start
```

## Credits

Wallpaper sources and licences are listed in
[`public/wallpapers/CREDITS.md`](public/wallpapers/CREDITS.md). The desktop pet
sprites come from [vscode-pets](https://github.com/tonybaloney/vscode-pets) (MIT).

## License

MIT
