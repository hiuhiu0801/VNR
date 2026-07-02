# Checklist chuẩn bị trước khi code

## 1. Chuẩn bị tài khoản và token

- Tạo hoặc dùng tài khoản Mapbox.
- Tạo public access token dạng `pk...`.
- Restrict token theo domain khi đưa lên production.
- Thêm token vào `.env.local`:

```env
VITE_MAPBOX_TOKEN=pk_your_token_here
```

- Không commit token thật vào git.
- Cập nhật `.env.example` sau khi bắt đầu implement:

```env
VITE_MAPBOX_TOKEN=
```

## 2. Chuẩn bị package

Package cần cài:

```bash
npm install mapbox-gl
```

Nếu TypeScript báo thiếu type thì kiểm tra version hiện tại trước. Mapbox GL JS các bản mới đã có type đi kèm.

## 3. Chuẩn bị dữ liệu lịch sử

Cần chốt trước:

- Danh sách 4 giai đoạn.
- Danh sách mốc sự kiện theo đúng thứ tự thời gian.
- Tọa độ `[lng, lat]` cho từng địa điểm.
- Nội dung chi tiết của từng mốc.
- Ảnh tư liệu tương ứng.
- Nguồn tài liệu hoặc ghi chú nguồn.

Không nên vừa code vừa tìm nội dung vì sẽ làm component bị lẫn giữa logic map và dữ liệu lịch sử.

## 4. Chuẩn bị ảnh tư liệu

Tạo thư mục:

```txt
public/images/august1945/
```

Đặt tên file không dấu, không khoảng trắng:

```txt
pac-bo-1941.jpg
tan-trao-1945.jpg
ha-noi-1945.jpg
hue-1945.jpg
sai-gon-1945.jpg
doc-lap-1945.jpg
```

Mỗi ảnh cần có:

- `src`
- `caption`
- `credit` nếu biết
- `year` nếu biết

## 5. Chuẩn bị ảnh bản đồ cũ nếu muốn overlay

Nếu muốn phủ bản đồ Việt Nam/Đông Dương cũ lên Mapbox, cần chuẩn bị:

- File ảnh bản đồ đủ nét.
- Tọa độ 4 góc ảnh.
- Hoặc georeference bằng QGIS trước.

Thư mục đề xuất:

```txt
public/images/maps/
```

Ví dụ:

```txt
public/images/maps/indochina-1945.jpg
```

## 6. Chuẩn bị cấu trúc code

Trước khi code nên thống nhất các file sẽ có:

```txt
src/data/august1945Route.ts
src/components/HistoricalVietnamMap.tsx
src/components/map/MapMarker.tsx
src/components/map/MapPhaseTabs.tsx
src/components/map/EventDetailModal.tsx
src/components/map/MapLegend.tsx
```

Nếu muốn làm gọn hơn ở bước đầu, chỉ cần:

```txt
src/data/august1945Route.ts
src/components/HistoricalVietnamMap.tsx
```

Rồi tách nhỏ sau khi bản đồ chạy ổn.

## 7. Chuẩn bị tiêu chí hoàn thành

Một vòng implement chỉ được coi là xong khi:

- Map render không blank.
- Marker đúng vị trí tương đối.
- Route line nối đúng thứ tự.
- Bấm marker mở được nội dung chi tiết.
- Popup/modal không tràn layout.
- Ảnh tư liệu load được hoặc hiện fallback rõ ràng.
- Mobile không vỡ layout.
- `npm run lint` pass.
- `npm run build` pass.

