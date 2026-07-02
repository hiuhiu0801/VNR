# Checklist kiểm thử

## Kiểm thử local

Chạy:

```bash
npm run lint
npm run build
npm run dev
```

Mở app ở URL Vite cung cấp, thường là:

```txt
http://localhost:3000/
```

hoặc:

```txt
http://localhost:5173/
```

## Kiểm thử map

- Map render không bị trắng.
- Không lỗi token trong console.
- Việt Nam nằm trong viewport ban đầu.
- Pitch/terrain không làm marker lệch khó nhìn.
- Zoom/pan hoạt động bình thường.
- Attribution của Mapbox không bị che.

## Kiểm thử route

- Line nối đúng thứ tự thời gian.
- Tuyến Bắc -> Trung -> Nam -> Hà Nội/toàn quốc có logic học tập rõ.
- Khi chọn giai đoạn, camera bay đến vùng phù hợp.
- Active marker nổi bật nhưng không phá layout.
- Các màu giai đoạn dễ phân biệt.

## Kiểm thử popup/modal

- Bấm marker mở đúng nội dung.
- Đóng modal được bằng nút close.
- Đóng modal được bằng phím Escape nếu có implement.
- Nội dung dài cuộn trong modal, không làm page vỡ.
- Ảnh không méo, có caption.
- Khi ảnh thiếu, hiện fallback thay vì icon lỗi xấu.

## Kiểm thử mobile

Viewport cần kiểm:

- 390 x 844
- 430 x 932
- 768 x 1024
- 1366 x 768
- 1440 x 900

Trên mobile:

- Map đủ cao để thao tác.
- Panel giai đoạn không che hết map.
- Modal chiếm màn hình hợp lý và cuộn được.
- Button/marker đủ dễ bấm.

## Kiểm thử nội dung

Với mỗi mốc, phải trả lời đủ:

- Sự kiện xảy ra khi nào?
- Ở đâu?
- Bối cảnh là gì?
- Có những việc tiêu biểu nào?
- Cách thức thực hiện hoặc cách giành thắng lợi ra sao?
- Kết quả và ý nghĩa là gì?
- Có ảnh hoặc fallback ảnh không?

## Kiểm thử performance

- Không tạo lại map liên tục khi React re-render.
- Cleanup map khi component unmount.
- Không add duplicate layer/source khi hot reload.
- Ảnh tư liệu nên tối ưu dung lượng.
- Không import package 3D nặng nếu chưa cần.

## Điều kiện hoàn thành

Chỉ chuyển sang thay thế timeline cũ khi:

- Token hoạt động.
- Map render ổn.
- Route và marker đúng.
- Modal nội dung đầy đủ.
- Ảnh tư liệu có cấu trúc sẵn.
- `npm run lint` pass.
- `npm run build` pass.

