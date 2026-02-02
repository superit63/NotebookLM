#!/bin/bash
# ================================================
# INCOSEARCH Backend - Ubuntu VPS Setup Script
# ================================================
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   🔍 INCOSEARCH Backend Setup for Ubuntu   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================
# 1. System Update
# =============================================
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# =============================================
# 2. Install Node.js 20.x
# =============================================
echo -e "${YELLOW}[2/7] Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js version: $(node -v)${NC}"

# =============================================
# 3. Install Python & pip (for notebooklm-mcp-cli)
# =============================================
echo -e "${YELLOW}[3/7] Installing Python 3 & pip...${NC}"
sudo apt install -y python3 python3-pip python3-venv

# =============================================
# 4. Install PM2 (Process Manager)
# =============================================
echo -e "${YELLOW}[4/7] Installing PM2...${NC}"
sudo npm install -g pm2

# =============================================
# 5. Install notebooklm-mcp-cli
# =============================================
echo -e "${YELLOW}[5/7] Installing notebooklm-mcp-cli...${NC}"
pip3 install --user notebooklm-mcp-cli
echo -e "${GREEN}notebooklm-mcp-cli installed!${NC}"

# =============================================
# 6. Setup Backend
# =============================================
echo -e "${YELLOW}[6/7] Setting up backend...${NC}"

# Install dependencies
npm install

# Copy env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your settings!${NC}"
fi

# Setup Prisma database
npx prisma generate
npx prisma db push

# Seed database
npx tsx src/scripts/seed.ts

# =============================================
# 7. Start with PM2
# =============================================
echo -e "${YELLOW}[7/7] Starting server with PM2...${NC}"

# Build TypeScript
npm run build

# Start with PM2
pm2 delete incosearch-api 2>/dev/null || true
pm2 start dist/index.js --name "incosearch-api"
pm2 save

# Setup PM2 startup
echo -e "${YELLOW}Setting up PM2 startup...${NC}"
pm2 startup

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ INCOSEARCH Backend Setup Complete!    ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Edit .env file: nano .env"
echo "2. Set JWT_SECRET (generate with: openssl rand -base64 32)"
echo "3. Run notebooklm-mcp-auth to login to Google"
echo "4. Get NOTEBOOK_ID with: nlm notebook list"
echo "5. Restart: pm2 restart incosearch-api"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo "  Admin: admin / admin123"
echo "  User:  user / user123"
echo ""
echo -e "${RED}⚠️  Change passwords after deployment!${NC}"
