# INCOSEARCH - Hướng Dẫn Deploy Chi Tiết

## 📋 Tổng Quan

INCOSEARCH gồm 2 phần cần deploy riêng:
- **Frontend** → Netlify (FREE)
- **Backend** → VPS Ubuntu

---

## 🖥️ PHẦN 1: DEPLOY BACKEND LÊN VPS

### Yêu cầu VPS
- Ubuntu 20.04+ / 22.04
- RAM: 1GB+ (khuyến nghị 2GB)
- CPU: 1 core
- Storage: 10GB+

### Bước 1: SSH vào VPS
```bash
ssh root@your-vps-ip
```

### Bước 2: Tạo user mới (an toàn hơn root)
```bash
adduser incosearch
usermod -aG sudo incosearch
su - incosearch
```

### Bước 3: Clone repo
```bash
git clone https://github.com/YOUR_USERNAME/incosearch.git
cd incosearch/backend
```

### Bước 4: Chạy setup tự động
```bash
chmod +x setup.sh
./setup.sh
```

### Bước 5: Cấu hình .env
```bash
nano .env
```

Sửa các giá trị sau:
```env
# Tạo secret mới
JWT_SECRET="$(openssl rand -base64 32)"

# Port (có thể giữ 3001)
PORT=3001

# CORS - URL frontend của bạn
FRONTEND_URL="https://your-app.netlify.app"
```

### Bước 6: Đăng nhập NotebookLM
```bash
# Xác thực với Google (cần màn hình hoặc X11 forwarding)
notebooklm-mcp-auth

# Lấy danh sách notebooks
nlm notebook list

# Copy ID notebook bạn muốn dùng
nano .env
# Paste vào NOTEBOOK_ID
```

### Bước 7: Khởi động lại server
```bash
pm2 restart incosearch-api
```

### Bước 8: Cấu hình Nginx (Optional nhưng khuyến nghị)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/incosearch
```

Paste:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/incosearch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 9: SSL với Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🌐 PHẦN 2: DEPLOY FRONTEND LÊN NETLIFY

### Option A: GitHub Integration (Khuyến nghị)

1. Push code lên GitHub
2. Đăng nhập [Netlify](https://app.netlify.com)
3. **Add new site** → **Import an existing project**
4. Chọn GitHub → Chọn repo
5. Cấu hình:
   - **Branch**: main
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/out`
6. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`
7. Deploy!

### Option B: Manual Deploy

```bash
cd frontend
npm install
npm run build
```

Kéo thả folder `out/` vào Netlify dashboard.

---

## ✅ KIỂM TRA HOẠT ĐỘNG

### 1. Test Backend
```bash
curl https://api.yourdomain.com/api/health
# Kết quả: {"status":"ok","timestamp":"..."}
```

### 2. Test Login
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Truy cập Frontend
Mở browser: `https://your-app.netlify.app`

---

## 🔒 BẢO MẬT SAU DEPLOY

### 1. Đổi mật khẩu Admin
Đăng nhập với admin/admin123 → vào Admin panel → đổi password

### 2. Tắt user test
Xóa user "user" nếu không cần

### 3. Kiểm tra CORS
Đảm bảo `FRONTEND_URL` trong .env chỉ chứa domain frontend thực

### 4. Backup định kỳ
```bash
# Backup database
cp /path/to/backend/data/incosearch.db /backup/incosearch-$(date +%Y%m%d).db
```

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### NotebookLM auth hết hạn
```bash
notebooklm-mcp-auth
pm2 restart incosearch-api
```

### Frontend không kết nối được Backend
1. Kiểm tra CORS: `FRONTEND_URL` phải đúng
2. Kiểm tra Nginx đang chạy
3. Kiểm tra SSL certificate còn hiệu lực

### Database bị lỗi
```bash
# Reset database (MẤT DATA!)
cd backend
rm -rf data/
npx prisma db push
npx tsx src/scripts/seed.ts
pm2 restart incosearch-api
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs incosearch-api`
2. Kiểm tra status: `pm2 status`
3. Liên hệ IT team
