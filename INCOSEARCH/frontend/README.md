# INCOSEARCH Frontend

Next.js frontend for INCOSEARCH, optimized for Netlify deployment.

## Quick Start (Windows Development)

```bash
# Run setup script
setup.bat

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── login/              # Login page
│   │   ├── chat/               # Main chat interface
│   │   ├── admin/              # Admin panel
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage (redirect)
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── ui.tsx              # Base UI components
│   │   ├── ChatMessage.tsx     # Message display
│   │   ├── ChatInput.tsx       # Message input
│   │   ├── Sidebar.tsx         # Chat list sidebar
│   │   └── AuthGuard.tsx       # Auth protection
│   ├── store/                  # Zustand stores
│   │   ├── auth.ts             # Authentication state
│   │   └── chat.ts             # Chat state
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│       └── index.ts
├── public/                     # Static assets
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind config
└── package.json
```

## Building for Production

```bash
# Build static export
npm run build

# Output will be in the 'out' directory
```

## Netlify Deployment

### Option 1: Connect GitHub

1. Push code to GitHub
2. Login to Netlify
3. New Site → Import from Git
4. Select repository
5. Build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/out`
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your backend URL

### Option 2: Manual Deploy

```bash
# Build
npm run build

# Drag & drop the 'out' folder to Netlify
```

## Features

- 🔐 JWT Authentication
- 💬 Real-time chat interface
- 📱 Fully responsive design
- 🎨 Healthcare-themed UI
- 📝 Markdown rendering
- 📄 Citation display
- 👥 Admin user management
- 🌙 Clean, modern aesthetics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **State:** Zustand
- **Markdown:** react-markdown
- **TypeScript:** Full type safety
