# INCOSEARCH

Hệ thống tra cứu thông tin nội bộ sử dụng Google NotebookLM làm engine AI.

## Kiến Trúc

```
INCOSEARCH/
├── frontend/          → Next.js (Deploy lên Netlify)
├── backend/           → Express.js API (Deploy lên VPS)
└── vendor/
    └── notebooklm-mcp-cli/  → CLI tool kết nối NotebookLM
```

## Quick Start

### 1. Backend (VPS)

```bash
cd backend

# Cài đặt dependencies
npm install

# Cấu hình
cp .env.example .env
# Sửa file .env: JWT_SECRET, NOTEBOOK_ID

# Tạo database
npx prisma db push

# Tạo user admin mặc định
npx tsx src/scripts/seed.ts

# Chạy server
npm run dev    # Development
npm start      # Production
```

### 2. NotebookLM MCP CLI (Trên VPS)

```bash
# Cài đặt tool
pip install notebooklm-mcp-cli

# Hoặc sử dụng uv
uv tool install notebooklm-mcp-cli

# Đăng nhập Google (lần đầu, cần browser)
notebooklm-mcp-auth

# Lấy Notebook ID
nlm notebook list
# Copy ID của notebook bạn muốn dùng → paste vào .env (NOTEBOOK_ID)
```

### 3. Frontend (Netlify)

```bash
cd frontend

# Cài đặt
npm install

# Cấu hình
cp .env.example .env.production
# Sửa NEXT_PUBLIC_API_URL = URL backend của bạn

# Build
npm run build

# Output folder: out/ → Deploy lên Netlify
```

## Deploy Guide

### Backend (VPS với Ubuntu)

```bash
# Clone repo
git clone <your-repo-url>
cd INCOSEARCH/backend

# Cài Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài PM2
sudo npm install -g pm2

# Setup
npm install
cp .env.example .env
nano .env  # Chỉnh sửa cấu hình

npx prisma db push
npx tsx src/scripts/seed.ts

# Chạy với PM2
pm2 start npm --name "incosearch-api" -- start
pm2 save
pm2 startup
```

### Frontend (Netlify)

1. Connect GitHub repo
2. Settings:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/out`
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`

## Default Credentials

```
Admin:
  Username: admin
  Password: admin123

User (Test):
  Username: user
  Password: user123
```

⚠️ **QUAN TRỌNG:** Đổi mật khẩu sau khi deploy!

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS, Zustand
- **Backend:** Express.js, Prisma, SQLite, JWT
- **AI Engine:** Google NotebookLM (via notebooklm-mcp-cli)

## License

Internal use only - INCOTEC © 2024
