# Workflow trước khi code Mapbox GL JS

Tài liệu này là bước chuẩn bị trước khi bắt tay sửa UI `UprisingRoute` thành bản đồ hành trình lịch sử bằng Mapbox GL JS.

Mục tiêu: biến phần "Hành trình Tổng khởi nghĩa" thành một trải nghiệm học tập trực quan về chủ đề:

> Từ chuẩn bị lực lượng đến bảo vệ thành quả Cách mạng Tháng Tám 1945

Không code ngay khi chưa chuẩn bị đủ dữ liệu, ảnh, token, cấu trúc component và tiêu chí kiểm thử.

## Bộ tài liệu trong thư mục này

- [01-product-model.md](./01-product-model.md): mô hình sản phẩm sẽ làm gì, người học tương tác ra sao.
- [02-preparation-checklist.md](./02-preparation-checklist.md): tất cả việc cần chuẩn bị trước khi code.
- [03-mapbox-setup.md](./03-mapbox-setup.md): env, package, config và quy tắc dùng Mapbox token.
- [04-data-and-assets.md](./04-data-and-assets.md): chuẩn bị dữ liệu mốc sự kiện, tọa độ, ảnh tư liệu cũ.
- [05-code-workflow.md](./05-code-workflow.md): workflow triển khai code theo từng bước an toàn.
- [06-qa-checklist.md](./06-qa-checklist.md): checklist kiểm thử UI, bản đồ, popup, mobile và build.
- [07-popup-content-draft.md](./07-popup-content-draft.md): bản nháp nội dung popup theo giai đoạn và địa điểm, dùng để duyệt trước khi code.

## Quyết định chốt

- Dùng Mapbox GL JS thay cho CesiumJS.
- Giữ trọng tâm là web học tập, không biến thành bản đồ kỹ thuật quá nặng.
- Map có hiệu ứng 3D nhẹ: tilt camera, terrain, route phát sáng, marker theo giai đoạn.
- Nội dung chi tiết của từng mốc mở bằng popup/modal để tránh tràn layout.
- Ảnh tư liệu cũ được thêm theo từng mốc, có caption và nguồn rõ ràng.
- Nếu có bản đồ Việt Nam/Đông Dương cũ, có thể phủ lên map bằng raster image overlay sau khi georeference.

## Luồng làm việc tổng quát

1. Chuẩn bị Mapbox token và file `.env.local`.
2. Chốt danh sách 4 giai đoạn, 11 mốc chính, tọa độ và nội dung chi tiết.
3. Chuẩn bị ảnh tư liệu cũ, đặt đúng thư mục public.
4. Tách data riêng khỏi `App.tsx`.
5. Tạo component bản đồ mới, chưa xóa timeline cũ ngay.
6. Gắn Mapbox, marker, route line, popup/modal.
7. Thêm hiệu ứng 3D và lớp ảnh/bản đồ cũ nếu dữ liệu đủ.
8. Test desktop, mobile, build, lint.
