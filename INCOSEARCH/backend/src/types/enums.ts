export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum DocumentCategory {
  PRODUCT = 'PRODUCT',     // Sản phẩm công ty
  COMPETITOR = 'COMPETITOR', // Sản phẩm đối thủ
  GUIDELINE = 'GUIDELINE'   // WHO, CDC guidelines
}

export enum DocumentStatus {
  PENDING = 'PENDING',  // Chờ sync lên NotebookLM
  SYNCED = 'SYNCED',   // Đã có trên NotebookLM
  ERROR = 'ERROR',    // Lỗi khi sync
  MERGED = 'MERGED'    // Đã gộp vào file khác
}
