# INCOSEARCH Backend

Express.js API server for INCOSEARCH.

## Quick Start (Windows Development)

```bash
# Run setup script
setup.bat

# Start development server
npm run dev
```

## Quick Start (Ubuntu VPS)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/incosearch.db` |
| `JWT_SECRET` | JWT signing secret | Random 32+ char string |
| `PORT` | Server port | `3001` |
| `NOTEBOOK_ID` | NotebookLM notebook ID | Get from `nlm notebook list` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/users` | Create user (Admin) |
| GET | `/api/auth/users` | List users (Admin) |
| DELETE | `/api/auth/users/:id` | Delete user (Admin) |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | List user's chats |
| POST | `/api/chats` | Create new chat |
| GET | `/api/chats/:id` | Get chat with messages |
| DELETE | `/api/chats/:id` | Delete chat |
| POST | `/api/chats/:id/messages` | Send message & get AI response |

### Documents (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List documents |
| GET | `/api/documents/stats` | Get document statistics |
| POST | `/api/documents` | Add document record |
| POST | `/api/documents/:id/sync` | Sync to NotebookLM |
| DELETE | `/api/documents/:id` | Delete document |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build TypeScript |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## NotebookLM CLI Setup

```bash
# Install CLI
pip3 install notebooklm-mcp-cli

# Authenticate (opens Chrome)
notebooklm-mcp-auth

# List notebooks to get ID
nlm notebook list

# Copy the ID you want to use
```

## Production Deployment (PM2)

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/index.js --name "incosearch-api"

# Enable startup
pm2 startup
pm2 save
```

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| user | user123 | User |

⚠️ **Change these after deployment!**
