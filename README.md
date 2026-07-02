# Web học tập Cách mạng Tháng Tám 1945

Chủ đề hiện tại: **Từ chuẩn bị lực lượng đến bảo vệ thành quả Cách mạng Tháng Tám 1945**.

## Chạy local

```bash
npm install
npm run dev
```

App chạy mặc định tại:

```text
http://localhost:3000
```

## OCR / chuẩn bị dữ liệu PDF

Các PDF hiện có text layer, nên bước này trích xuất chữ trực tiếp và tạo Markdown cho vector store.

Nếu Python hệ thống chưa có `pypdf`, cài trước:

```bash
python -m pip install -r requirements-ocr.txt
```

```bash
npm run prepare:august1945
```

Output nằm ở:

```text
knowledge/august-1945/
```

Script mặc định dùng:

- `C:\Users\LENOVO\Downloads\gt-lich-su-dang-csvn-ban-tuyen-giao-tw.pdf`
- `C:\Users\LENOVO\Downloads\noi_dung_ly_thuyet_cach_mang_thang_tam.pdf`
- `C:\Users\LENOVO\Downloads\PDF\Session 8.pdf`
- `C:\Users\LENOVO\Downloads\PDF\Session 9.pdf`
- `C:\Users\LENOVO\Downloads\PDF\Session 10.pdf`
- `C:\Users\LENOVO\Downloads\PDF\Session 11.pdf`

Trích đoạn giáo trình mặc định lấy trang PDF `43-70`, tương ứng phần chuẩn bị Cách mạng Tháng Tám đến bảo vệ chính quyền 1945-1946. Có thể đổi bằng:

```bash
python scripts/prepare-august-1945-ocr.py --textbook-pages 43-72
```

### Giáo trình đầy đủ từ OCR txt

Sau khi OCR PDF thành file `.txt`, chạy lệnh này để tách toàn bộ giáo trình thành các file Markdown nhỏ cho vector store:

```bash
npm run prepare:lsd-full
```

Mặc định script đọc:

```text
C:\Users\LENOVO\Downloads\gt-lich-su-dang-csvn-ban-tuyen-giao-tw.ocr.txt
```

Output nằm ở:

```text
knowledge/lich-su-dang-full/
```

Nếu OCR ra file khác, truyền đường dẫn mới:

```bash
python scripts/prepare-lsd-full-textbook-md.py --source-txt "C:\Users\LENOVO\Downloads\ten-file-moi.ocr.txt"
```

## Tạo vector store

1. Copy `.env.example` thành `.env.local`.
2. Điền key:

```env
VITE_LLM_API_KEY=your_openai_api_key
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4.1-mini
```

3. Chạy upload:

```bash
npm run upload:august1945-knowledge
```

Nếu muốn upload riêng bộ giáo trình đầy đủ:

```bash
npm run upload:lsd-textbook
```

4. Script sẽ in ra:

```env
VITE_AUGUST1945_VECTOR_STORE_ID=vs_...
VITE_LSD_TEXTBOOK_VECTOR_STORE_ID=vs_...
```

5. Dán dòng đó vào `.env.local`, restart dev server.

## Biến môi trường chính

```env
VITE_LLM_API_KEY=
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4.1-mini
VITE_AUGUST1945_VECTOR_STORE_ID=
VITE_LSD_TEXTBOOK_VECTOR_STORE_ID=
VITE_FILE_SEARCH_MAX_RESULTS=8
```

`VITE_LSD_TEXTBOOK_VECTOR_STORE_ID` chỉ cần dùng nếu muốn gắn thêm vector store giáo trình rộng hơn ngoài chủ đề 1940-1946.
