# 💡 BRIEF: INCOSEARCH

**Ngày tạo:** 02/02/2026
**Brainstorm cùng:** User & Antigravity

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
- Nhân viên cần tra cứu nhanh thông tin nội bộ về sản phẩm công ty, đối thủ và các guidelines y tế (WHO, CDC).
- Việc tra cứu thủ công mất thời gian, khó so sánh thông số giữa các sản phẩm.
- Cần một công cụ tập trung, trả lời chính xác dựa trên tài liệu đã có.

## 2. GIẢI PHÁP ĐỀ XUẤT
- Xây dựng **INCOSEARCH Webapp**.
- **Backend:** Sử dụng **NotebookLM** (thông qua `notebooklm-mcp-cli`) làm engine xử lý dữ liệu (RAG).
    - Tận dụng khả năng context lớn và độ chính xác cao của Gemini 1.5 Pro.
    - Không cần xây dựng vector DB phức tạp.
- **Frontend:** Giao diện User Chat thân thiện, dễ sử dụng.
- **Data Pipeline:** Upload file -> Auto Merge (nếu cần) -> Upload to NotebookLM.

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Nhân viên kinh doanh, kỹ thuật, marketing của công ty INCOTEC.
- **Admin:** Quản lý tài liệu và người dùng (User).

## 4. TÍNH NĂNG

### 🚀 MVP (Bắt buộc có):
- [ ] **Authentication:** Đăng nhập User/Pass (Admin cấp tài khoản).
- [ ] **Chat Interface:**
    - Chat với dữ liệu sản phẩm & guidelines.
    - Hiển thị trích dẫn (Citations) rõ ràng (click để xem nguồn).
- [ ] **Data Management (Admin):**
    - Upload file PDF/Doc từ Webapp.
    - Tự động đẩy file lên NotebookLM thông qua MCP Server.
- [ ] **Comparison Mode:** Tối ưu prompt để so sánh sản phẩm cty vs đối thủ.

### 🎁 Phase 2 (Làm sau):
- [ ] **Audio Overview:** Nghe tóm tắt dạng Podcast về tài liệu/sản phẩm mới.
- [ ] **History:** Lưu lịch sử chat.
- [ ] **Data Auto-Sync:** Tự động đồng bộ file từ Google Drive folder.

## 5. RỦI RO & LƯU Ý KỸ THUẬT
- **NotebookLM Source Limit:** Giới hạn 50 files/notebook.
    - *Giải pháp:* Gộp file PDF (Sản phẩm đối thủ gộp thành 1-2 file lớn) trước khi upload.
- **Authentication với Google:** `notebooklm-mcp-cli` dùng Cookie Auth.
    - *Giải pháp:* Cần cơ chế refresh cookie hoặc chạy headless browser trên server để duy trì session.
- **API Unofficial:** Phụ thuộc vào Internal API của Google -> Có rủi ro thay đổi.

## 7. BƯỚC TIẾP THEO
→ Chạy `/plan` để thiết kế kiến trúc hệ thống và DB.
