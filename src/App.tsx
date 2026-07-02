import { useEffect, useMemo, useRef, useState } from "react";
import { signInWithPopup, signOut, type User } from "firebase/auth";
import {
  Camera,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Flag,
  HelpCircle,
  Image,
  Landmark,
  Layers3,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Network,
  PanelRightOpen,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Sword,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import HTMLFlipBook from "react-pageflip";
import { useAuthState } from "react-firebase-hooks/auth";
import { FloatingChat } from "./components/FloatingChat";
import { HistoricalVietnamMap } from "./components/HistoricalVietnamMap";
import { SessionExplorer } from "./components/SessionExplorer";
import { UprisingRoute } from "./components/UprisingRoute";
import { auth, googleProvider } from "./lib/firebase";
import type {
  FlipPage,
  SessionBlock,
  SessionEventDetail,
  SessionEventDetailSeed,
  UprisingEvent,
} from "./types/august1945";

const sessions: SessionBlock[] = [
  {
    id: "session8",
    session: "Session 8",
    period: "1939-1941",
    title: "Chuẩn bị lực lượng cách mạng",
    tagline: "Chuyển hướng chiến lược, đặt nhiệm vụ giải phóng dân tộc lên hàng đầu.",
    icon: Network,
    heroImage: "/images/august1945/phase-prepare-bg.png",
    accent: "text-red-700 dark:text-red-200",
    summary:
      "Giai đoạn này giúp người học hiểu vì sao Đảng phải chuyển trọng tâm đấu tranh trong bối cảnh Chiến tranh thế giới thứ hai, từ đó chuẩn bị lực lượng chính trị, lực lượng vũ trang, căn cứ địa và mặt trận dân tộc thống nhất.",
    outcomes: [
      "Nắm được bối cảnh quốc tế và Đông Dương giai đoạn 1939-1941.",
      "Giải thích được chủ trương đặt nhiệm vụ giải phóng dân tộc lên hàng đầu.",
      "Phân biệt vai trò của lực lượng chính trị, lực lượng vũ trang và căn cứ địa.",
    ],
    keyIdeas: [
      "Hội nghị Trung ương 6, 7, 8 từng bước hoàn chỉnh chuyển hướng chiến lược.",
      "Mặt trận Việt Minh ra đời ngày 19/5/1941 để tập hợp lực lượng toàn dân.",
      "Khởi nghĩa Bắc Sơn, Nam Kỳ và binh biến Đô Lương là tín hiệu quan trọng của đấu tranh vũ trang.",
    ],
    events: [
      "9/1939: Chiến tranh thế giới thứ hai bùng nổ.",
      "9/1940: Nhật vào Đông Dương, nhân dân chịu cảnh một cổ hai tròng.",
      "19/5/1941: Mặt trận Việt Minh thành lập.",
    ],
    imageSlots: [
      {
        title: "Không gian chuẩn bị lực lượng",
        caption: "Background cũ được giữ lại cho giai đoạn xây dựng đường lối, căn cứ địa và lực lượng.",
        src: "/images/august1945/phase-prepare-bg.png",
        pathHint: "public/images/session8/can-cu-viet-bac.jpg",
      },
      {
        title: "Giải phóng quân Thái Nguyên",
        caption: "Tư liệu gợi liên hệ tới quá trình chuẩn bị và phát triển lực lượng cách mạng ở Việt Bắc.",
        src: "/images/august1945/giai-phong-quan-thai-nguyen-1945.jpg",
        pathHint: "public/images/session8/viet-minh.jpg",
      },
      {
        title: "Cứu Quốc quân Hải Phòng",
        caption: "Tư liệu về lực lượng vũ trang cách mạng, nối từ chuẩn bị lực lượng tới nhiệm vụ bảo vệ chính quyền.",
        src: "/images/august1945/cuu-quoc-quan-hai-phong-1945.jpg",
        pathHint: "public/images/session8/bac-son.jpg",
      },
    ],
    questions: [
      "Vì sao trong giai đoạn này nhiệm vụ giải phóng dân tộc được đặt lên hàng đầu?",
      "Việt Minh có vai trò gì trong quá trình chuẩn bị Tổng khởi nghĩa?",
    ],
  },
  {
    id: "session9",
    session: "Session 9",
    period: "3/1945-8/1945",
    title: "Cao trào kháng Nhật và chớp thời cơ",
    tagline: "Từ Nhật đảo chính Pháp đến quyết định phát động Tổng khởi nghĩa.",
    icon: Clock3,
    heroImage: "/images/august1945/phase-opportunity-bg.jpg",
    accent: "text-amber-700 dark:text-amber-200",
    summary:
      "Giai đoạn này làm rõ sự nhạy bén của Đảng trước biến động ngày 9/3/1945, nội dung chỉ thị ngày 12/3/1945 và cách cao trào kháng Nhật cứu nước trở thành bước tập dượt trực tiếp cho Tổng khởi nghĩa.",
    outcomes: [
      "Giải thích được tác động của sự kiện Nhật đảo chính Pháp ngày 9/3/1945.",
      "Nắm nội dung chính của chỉ thị 'Nhật - Pháp bắn nhau và hành động của chúng ta'.",
      "Liên hệ cao trào kháng Nhật với việc chuẩn bị thời cơ Tổng khởi nghĩa.",
    ],
    keyIdeas: [
      "Kẻ thù trực tiếp lúc này là phát xít Nhật.",
      "Cao trào kháng Nhật cứu nước phát triển trên nhiều địa bàn và nhiều hình thức.",
      "Phong trào phá kho thóc giải quyết nạn đói vừa có ý nghĩa kinh tế, vừa có ý nghĩa chính trị.",
    ],
    events: [
      "9/3/1945: Nhật đảo chính Pháp.",
      "12/3/1945: Ban Thường vụ Trung ương Đảng ra chỉ thị hành động.",
      "13-15/8/1945: Hội nghị toàn quốc của Đảng họp ở Tân Trào.",
    ],
    imageSlots: [
      {
        title: "Du kích Ba Tơ",
        caption: "Đội du kích Ba Tơ tiến về thị xã Quảng Ngãi, thể hiện khí thế cao trào kháng Nhật.",
        src: "/images/august1945/du-kich-ba-to-quang-ngai-1945.jpg",
        pathHint: "public/images/session9/nhat-dao-chinh-phap.jpg",
      },
      {
        title: "Cao trào kháng Nhật",
        caption: "Ảnh nền giai đoạn chớp thời cơ, nhấn mạnh chuyển động từ phong trào quần chúng sang khởi nghĩa.",
        src: "/images/august1945/phase-opportunity-bg.jpg",
        pathHint: "public/images/session9/pha-kho-thoc.jpg",
      },
      {
        title: "Tân Trào",
        caption: "Tư liệu về Hội nghị toàn quốc của Đảng và Quốc dân Đại hội.",
        src: "/images/august1945/giai-phong-quan-thai-nguyen-1945.jpg",
        pathHint: "public/images/session9/tan-trao.jpg",
      },
    ],
    questions: [
      "Vì sao chỉ thị ngày 12/3/1945 thể hiện sự nhạy bén chiến lược?",
      "Cao trào kháng Nhật cứu nước đã chuẩn bị gì cho Tổng khởi nghĩa?",
    ],
  },
  {
    id: "session10",
    session: "Session 10",
    period: "8/1945-9/1945",
    title: "Tổng khởi nghĩa và thắng lợi",
    tagline: "Hành động nhanh, rộng, đúng thời cơ để giành chính quyền trong cả nước.",
    icon: Flag,
    heroImage: "/images/august1945/phase-uprising-bg.jpg",
    accent: "text-emerald-700 dark:text-emerald-200",
    summary:
      "Giai đoạn này đi theo diễn biến Tổng khởi nghĩa từ Tân Trào đến các đô thị lớn, nhấn mạnh nghệ thuật chớp thời cơ, sức mạnh đại đoàn kết và ý nghĩa lịch sử của việc khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    outcomes: [
      "Trình bày được diễn biến chính của Tổng khởi nghĩa Tháng Tám.",
      "Xác định vai trò của Hà Nội, Huế, Sài Gòn trong nhịp lan tỏa cách mạng.",
      "Phân tích được ý nghĩa lịch sử và bài học kinh nghiệm của thắng lợi.",
    ],
    keyIdeas: [
      "Thời cơ xuất hiện khi Nhật đầu hàng Đồng minh và quân Đồng minh chưa kịp vào Đông Dương.",
      "Thắng lợi ở Hà Nội ngày 19/8/1945 cổ vũ mạnh mẽ các địa phương khác.",
      "Ngày 2/9/1945, Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    ],
    events: [
      "16/8/1945: Quân giải phóng tiến về Thái Nguyên.",
      "19/8/1945: Hà Nội giành chính quyền.",
      "23/8/1945: Huế giành chính quyền.",
      "25/8/1945: Sài Gòn giành chính quyền.",
      "2/9/1945: Tuyên ngôn Độc lập tại Ba Đình.",
    ],
    imageSlots: [
      {
        title: "Quần chúng trong Tổng khởi nghĩa",
        caption: "Tư liệu về khí thế quần chúng trong cao trào giành chính quyền tháng 8/1945.",
        src: "/images/august1945/sai-gon-dai-lo-norodom-25-8-1945.jpg",
        pathHint: "public/images/session10/ha-noi-19-8.jpg",
      },
      {
        title: "Lực lượng cách mạng Thái Nguyên",
        caption: "Tư liệu về lực lượng cách mạng sau khi giành chính quyền, nối căn cứ với làn sóng toàn quốc.",
        src: "/images/august1945/giai-phong-quan-thai-nguyen-1945.jpg",
        pathHint: "public/images/session10/hue-23-8.jpg",
      },
      {
        title: "Sài Gòn 25/8/1945",
        caption: "Tư liệu về phong trào Nam Bộ trong cao trào Tổng khởi nghĩa.",
        src: "/images/august1945/sai-gon-dai-lo-norodom-25-8-1945.jpg",
        pathHint: "public/images/session10/sai-gon-25-8.jpg",
      },
      {
        title: "Ba Đình 2/9/1945",
        caption: "Tư liệu về Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.",
        src: "/images/august1945/phase-uprising-bg.jpg",
        pathHint: "public/images/session10/ba-dinh-2-9.jpg",
      },
    ],
    questions: [
      "Tại sao thời cơ Tổng khởi nghĩa được xem là thời cơ 'ngàn năm có một'?",
      "Ý nghĩa lịch sử lớn nhất của Cách mạng Tháng Tám là gì?",
    ],
  },
  {
    id: "session11",
    session: "Session 11",
    period: "1945-1946",
    title: "Bảo vệ chính quyền cách mạng non trẻ",
    tagline: "Giữ vững thành quả cách mạng trước nạn đói, nạn dốt, thù trong và giặc ngoài.",
    icon: ShieldCheck,
    heroImage: "/images/august1945/phase-protect-bg.jpg",
    accent: "text-cyan-700 dark:text-cyan-200",
    summary:
      "Giai đoạn này chuyển trọng tâm từ giành chính quyền sang giữ chính quyền, phân tích những khó khăn sau ngày độc lập và các quyết sách xây dựng nhà nước mới, chống giặc đói, giặc dốt, giặc ngoại xâm.",
    outcomes: [
      "Nắm được các khó khăn căn bản của chính quyền cách mạng sau ngày 2/9/1945.",
      "Giải thích nội dung và ý nghĩa của Chỉ thị Kháng chiến kiến quốc.",
      "Phân tích chính sách hòa hoãn, nhân nhượng có nguyên tắc để bảo vệ độc lập.",
    ],
    keyIdeas: [
      "Chính quyền mới phải đối mặt cùng lúc với nạn đói, nạn dốt, tài chính kiệt quệ, quân đội nước ngoài và âm mưu Pháp quay lại.",
      "Tổng tuyển cử ngày 6/1/1946 tạo cơ sở pháp lý và chính danh cho nhà nước mới.",
      "Chỉ thị Kháng chiến kiến quốc ngày 25/11/1945 xác định nhiệm vụ cấp bách của cách mạng.",
    ],
    events: [
      "25/11/1945: Chỉ thị Kháng chiến kiến quốc.",
      "6/1/1946: Tổng tuyển cử bầu Quốc hội đầu tiên.",
      "6/3/1946: Hiệp định Sơ bộ Việt - Pháp.",
      "14/9/1946: Tạm ước Việt - Pháp.",
    ],
    imageSlots: [
      {
        title: "Cứu Quốc quân Hải Phòng",
        caption: "Tư liệu gợi nhiệm vụ giữ vững lực lượng và bảo vệ chính quyền sau ngày độc lập.",
        src: "/images/august1945/cuu-quoc-quan-hai-phong-1945.jpg",
        pathHint: "public/images/session11/tong-tuyen-cu.jpg",
      },
      {
        title: "Diệt giặc đói, giặc dốt",
        caption: "Tư liệu về bình dân học vụ, tăng gia sản xuất và cứu đói.",
        src: "/images/august1945/phase-protect-bg.jpg",
        pathHint: "public/images/session11/giac-doi-giac-dot.jpg",
      },
      {
        title: "Ngoại giao 1946",
        caption: "Tư liệu về sách lược hòa hoãn để chuẩn bị thực lực.",
        src: "/images/august1945/cuu-quoc-quan-hai-phong-1945.jpg",
        pathHint: "public/images/session11/ngoai-giao-1946.jpg",
      },
    ],
    questions: [
      "Vì sao bảo vệ chính quyền non trẻ là nhiệm vụ sống còn sau Cách mạng Tháng Tám?",
      "Chính sách hòa hoãn với Pháp năm 1946 có ý nghĩa gì?",
    ],
  },
];

const sessionEventDetails: Record<string, SessionEventDetailSeed[]> = {
  session8: [
    {
      title: "Chiến tranh thế giới thứ hai bùng nổ",
      overview:
        "Mốc 9/1939 không phải là một trận thắng cụ thể, mà là điểm mở đầu khiến tình thế cách mạng thay đổi. Chiến tranh làm bộ máy thuộc địa siết chặt bóc lột, mâu thuẫn dân tộc gay gắt hơn và yêu cầu độc lập trở thành nhiệm vụ cấp bách.",
      milestones: [
        "Chiến tranh thế giới thứ hai lan rộng, tác động trực tiếp tới các thuộc địa, trong đó có Đông Dương.",
        "Thực dân Pháp tăng đàn áp, vơ vét sức người, sức của để phục vụ chiến tranh.",
        "Đảng bắt đầu chuyển trọng tâm từ các yêu sách dân sinh, dân chủ sang nhiệm vụ giải phóng dân tộc.",
      ],
      methodTitle: "Cách Đảng chuyển hướng",
      methods: [
        "Xác định mâu thuẫn dân tộc là mâu thuẫn nổi bật nhất trong bối cảnh chiến tranh.",
        "Từng bước hoàn chỉnh đường lối qua các Hội nghị Trung ương 6, 7 và 8.",
        "Chuẩn bị lực lượng chính trị, căn cứ địa, tuyên truyền và tổ chức quần chúng cho thời cơ lớn hơn.",
      ],
      result:
        "Mốc này đặt nền cho toàn bộ giai đoạn chuẩn bị: mục tiêu giành độc lập được đưa lên hàng đầu, tạo cơ sở để hình thành lực lượng và mặt trận dân tộc thống nhất.",
      imageTitle: "Bản đồ căn cứ Việt Bắc",
      imageCaption: "Minh họa không gian chuẩn bị căn cứ địa và lực lượng cách mạng trong giai đoạn chuyển hướng.",
      imageHint: "public/images/session8/can-cu-viet-bac.jpg",
    },
    {
      title: "Nhật vào Đông Dương",
      overview:
        "Khi Nhật kéo vào Đông Dương, nhân dân rơi vào tình cảnh bị cả thực dân Pháp và phát xít Nhật áp bức. Đây là lý do nhiệm vụ dân tộc trở nên rõ ràng và cấp bách hơn.",
      milestones: [
        "Nhật dùng Đông Dương làm bàn đạp quân sự và nguồn cung chiến tranh.",
        "Pháp vẫn duy trì bộ máy cai trị, tạo tình thế nhân dân chịu cảnh một cổ hai tròng.",
        "Các phong trào như Bắc Sơn, Nam Kỳ, Đô Lương báo hiệu xu hướng đấu tranh vũ trang.",
      ],
      methodTitle: "Cách chuẩn bị lực lượng",
      methods: [
        "Tập hợp rộng rãi các tầng lớp yêu nước thay vì chỉ dựa vào một lực lượng hẹp.",
        "Kết hợp lực lượng chính trị của quần chúng với mầm mống lực lượng vũ trang.",
        "Xây dựng căn cứ, đường dây liên lạc và cơ sở bí mật để tránh bị đàn áp trực diện.",
      ],
      result:
        "Tình thế một cổ hai tròng làm cơ sở xã hội của cách mạng mở rộng, giúp phong trào chuyển dần từ phản ứng tự phát sang chuẩn bị có tổ chức.",
      imageTitle: "Không gian Đông Dương 1940",
      imageCaption: "Tư liệu minh họa tình thế chính trị khi Nhật kéo vào Đông Dương.",
      imageHint: "public/images/session8/nhat-vao-dong-duong.jpg",
    },
    {
      title: "Mặt trận Việt Minh thành lập",
      overview:
        "Ngày 19/5/1941, Việt Minh ra đời tại Pác Bó, gắn với chủ trương đoàn kết toàn dân để đánh đuổi Pháp - Nhật và giành độc lập. Đây là công cụ tổ chức quan trọng nhất của giai đoạn chuẩn bị.",
      milestones: [
        "Hội nghị Trung ương 8 hoàn chỉnh chủ trương đặt giải phóng dân tộc lên hàng đầu.",
        "Việt Minh đưa mục tiêu độc lập thành lời hiệu triệu dễ hiểu, dễ tham gia với đông đảo quần chúng.",
        "Các hội cứu quốc, lực lượng tự vệ, cơ sở tuyên truyền được gây dựng ở nhiều địa phương.",
      ],
      methodTitle: "Cách tổ chức phong trào",
      methods: [
        "Dùng hình thức mặt trận để liên hiệp công nhân, nông dân, trí thức, thanh niên, phụ nữ và các lực lượng yêu nước.",
        "Tổ chức quần chúng theo các đoàn thể cứu quốc, vừa tuyên truyền vừa xây dựng cơ sở hành động.",
        "Kết hợp căn cứ địa Cao Bằng - Việt Bắc với mạng lưới cơ sở ở đồng bằng, đô thị.",
      ],
      result:
        "Việt Minh biến tinh thần yêu nước thành sức mạnh có tổ chức, tạo lực lượng chính trị rộng lớn cho Tổng khởi nghĩa sau này.",
      imageTitle: "Mặt trận Việt Minh",
      imageCaption: "Tư liệu minh họa quá trình xây dựng mặt trận dân tộc thống nhất.",
      imageHint: "public/images/session8/viet-minh.jpg",
    },
  ],
  session9: [
    {
      title: "Nhật đảo chính Pháp",
      overview:
        "Ngày 9/3/1945, Nhật đảo chính Pháp, độc chiếm Đông Dương. Mốc này làm kẻ thù trực tiếp chuyển thành phát xít Nhật và mở ra tình thế tiền khởi nghĩa.",
      milestones: [
        "Bộ máy cai trị Pháp bị Nhật gạt khỏi vị trí thống trị trực tiếp.",
        "Chính quyền Nhật dựng lên các hình thức kiểm soát mới nhưng tình thế chính trị rối loạn hơn.",
        "Phong trào cách mạng có cơ hội chuyển nhanh từ chuẩn bị sang phát động cao trào.",
      ],
      methodTitle: "Cách nắm biến động",
      methods: [
        "Không chờ tình hình ổn định mà nhanh chóng xác định lại kẻ thù trực tiếp.",
        "Chuyển khẩu hiệu và phương thức đấu tranh sang kháng Nhật cứu nước.",
        "Mở rộng cao trào quần chúng để biến khủng hoảng của địch thành lợi thế của cách mạng.",
      ],
      result:
        "Đảo chính Nhật - Pháp làm thời cơ cách mạng đến gần hơn, buộc Đảng phải hành động nhanh và chính xác để không bỏ lỡ nhịp lịch sử.",
      imageTitle: "Nhật đảo chính Pháp",
      imageCaption: "Tư liệu về bước ngoặt làm thay đổi kẻ thù trực tiếp của cách mạng.",
      imageHint: "public/images/session9/nhat-dao-chinh-phap.jpg",
    },
    {
      title: "Chỉ thị hành động ngày 12/3/1945",
      overview:
        "Chỉ thị 'Nhật - Pháp bắn nhau và hành động của chúng ta' ra đời ngay sau đảo chính, trả lời câu hỏi phải làm gì khi tình thế thay đổi. Đây là bản định hướng hành động cho cao trào kháng Nhật.",
      milestones: [
        "Xác định phát xít Nhật là kẻ thù chính, trực tiếp trước mắt.",
        "Phát động cao trào kháng Nhật cứu nước trên nhiều địa bàn.",
        "Phong trào phá kho thóc cứu đói vừa giải quyết nhu cầu dân sinh, vừa kéo quần chúng vào hành động chính trị.",
      ],
      methodTitle: "Cách biến cao trào thành tập dượt",
      methods: [
        "Đưa khẩu hiệu sát đời sống để quần chúng tham gia ngay, không chỉ nghe tuyên truyền.",
        "Kết hợp đấu tranh chính trị, tuyên truyền, tự vệ vũ trang và giành quyền làm chủ ở từng nơi.",
        "Tạo trạng thái sẵn sàng: khi thời cơ đến, cơ sở cách mạng có thể chuyển sang khởi nghĩa.",
      ],
      result:
        "Chỉ thị 12/3 làm phong trào chuyển từ chuẩn bị âm thầm sang cao trào hành động, là bước tập dượt trực tiếp cho Tổng khởi nghĩa tháng 8/1945.",
      imageTitle: "Phá kho thóc",
      imageCaption: "Hình ảnh minh họa cao trào kháng Nhật cứu nước và giải quyết nạn đói.",
      imageHint: "public/images/session9/pha-kho-thoc.jpg",
    },
    {
      title: "Hội nghị toàn quốc của Đảng ở Tân Trào",
      overview:
        "Tân Trào là điểm hội tụ quyết sách cuối cùng trước Tổng khởi nghĩa. Khi Nhật đầu hàng Đồng minh, Đảng quyết định phát động khởi nghĩa trước khi quân Đồng minh vào Đông Dương.",
      milestones: [
        "Hội nghị toàn quốc của Đảng họp tại Tân Trào, quyết định phát động Tổng khởi nghĩa.",
        "Ủy ban Khởi nghĩa toàn quốc được lập và Quân lệnh số 1 được ban bố.",
        "Quốc dân Đại hội thông qua chủ trương lớn, bầu Ủy ban Dân tộc Giải phóng.",
      ],
      methodTitle: "Cách chớp thời cơ",
      methods: [
        "Ra quyết định ở thời điểm địch tan rã nhưng lực lượng bên ngoài chưa kịp vào thay thế.",
        "Thống nhất mệnh lệnh từ trung ương tới địa phương để hành động đồng loạt.",
        "Kết hợp chính danh chính trị của Quốc dân Đại hội với lực lượng vũ trang và cơ sở quần chúng.",
      ],
      result:
        "Mốc Tân Trào biến thời cơ thành mệnh lệnh hành động, mở đường cho làn sóng giành chính quyền trên phạm vi cả nước.",
      imageTitle: "Tân Trào",
      imageCaption: "Tư liệu về Hội nghị toàn quốc của Đảng và Quốc dân Đại hội.",
      imageHint: "public/images/session9/tan-trao.jpg",
    },
  ],
  session10: [
    {
      title: "Quân giải phóng tiến về Thái Nguyên",
      overview:
        "Ngày 16/8/1945, từ căn cứ Tân Trào, lực lượng Giải phóng quân tiến về Thái Nguyên. Đây là bước chuyển từ quyết định chính trị sang hành động quân sự mở đầu.",
      milestones: [
        "Lực lượng vũ trang xuất phát từ căn cứ địa cách mạng.",
        "Thái Nguyên trở thành hướng tiến công tiêu biểu đầu tiên của lệnh khởi nghĩa.",
        "Tin thắng lợi và khí thế vũ trang thúc đẩy các địa phương hành động mạnh hơn.",
      ],
      methodTitle: "Cách mở đầu thắng lợi",
      methods: [
        "Dùng lực lượng vũ trang làm mũi nhọn ở nơi có điều kiện thuận lợi.",
        "Kết hợp tiến công quân sự với nổi dậy của quần chúng tại địa phương.",
        "Tạo hiệu ứng tâm lý: chứng minh lệnh Tổng khởi nghĩa đã chuyển thành hành động thật.",
      ],
      result:
        "Mốc Thái Nguyên tạo nhịp mở đầu cho giai đoạn giành chính quyền, nối căn cứ Tân Trào với làn sóng khởi nghĩa ở đô thị và địa phương.",
      imageTitle: "Thái Nguyên 16/8/1945",
      imageCaption: "Tư liệu về hành động quân giải phóng xuất phát từ căn cứ cách mạng.",
      imageHint: "public/images/route/thai-nguyen.jpg",
    },
    {
      title: "Hà Nội giành chính quyền",
      overview:
        "Ngày 19/8/1945, Hà Nội giành chính quyền. Vì Hà Nội là trung tâm chính trị lớn, thắng lợi ở đây có tác dụng cổ vũ và tạo nhịp quyết định cho cả nước.",
      milestones: [
        "Quần chúng tập hợp đông đảo, biến mít tinh thành hành động cách mạng.",
        "Các lực lượng cách mạng chiếm những cơ quan trọng yếu của chính quyền cũ.",
        "Chính quyền cách mạng được thiết lập ở trung tâm chính trị quan trọng nhất miền Bắc.",
      ],
      methodTitle: "Cách giành thắng lợi ở đô thị",
      methods: [
        "Lấy lực lượng chính trị quần chúng làm sức ép chủ đạo.",
        "Hành động nhanh vào cơ quan đầu não khi bộ máy địch hoang mang, mất chỗ dựa.",
        "Tránh kéo dài đối đầu vũ trang không cần thiết, ưu tiên giành chính quyền bằng khí thế áp đảo.",
      ],
      result:
        "Thắng lợi ở Hà Nội tạo hiệu ứng lan tỏa mạnh, giúp Huế, Sài Gòn và nhiều địa phương khác có thêm niềm tin, tốc độ và quyết tâm hành động.",
      imageTitle: "Hà Nội 19/8/1945",
      imageCaption: "Tư liệu về mít tinh, biểu tình và giành chính quyền ở Hà Nội.",
      imageHint: "public/images/session10/ha-noi-19-8.jpg",
    },
    {
      title: "Huế giành chính quyền",
      overview:
        "Ngày 23/8/1945, Huế giành chính quyền. Đây là mốc có ý nghĩa biểu tượng vì Huế là kinh đô cũ và là nơi gắn với triều Nguyễn.",
      milestones: [
        "Phong trào quần chúng ở Huế nổi lên sau thắng lợi Hà Nội.",
        "Các cơ quan chính quyền cũ bị thay thế bởi lực lượng cách mạng.",
        "Sau đó, sự kiện Bảo Đại thoái vị càng khẳng định sự chấm dứt của chế độ quân chủ.",
      ],
      methodTitle: "Cách xử lý trung tâm biểu tượng",
      methods: [
        "Tận dụng khí thế thắng lợi từ Hà Nội để làm lung lay bộ máy cũ.",
        "Dựa vào biểu tình chính trị lớn và sự ủng hộ của nhân dân để cô lập chính quyền phong kiến.",
        "Giành chính quyền theo hướng nhanh, gọn, giảm đổ máu và giữ trật tự xã hội.",
      ],
      result:
        "Thắng lợi ở Huế cho thấy Tổng khởi nghĩa không chỉ giành cơ quan hành chính, mà còn làm sụp đổ nền tảng chính trị biểu tượng của chế độ cũ.",
      imageTitle: "Huế 23/8/1945",
      imageCaption: "Tư liệu về sự chuyển giao quyền lực ở kinh đô Huế.",
      imageHint: "public/images/session10/hue-23-8.jpg",
    },
    {
      title: "Sài Gòn giành chính quyền",
      overview:
        "Ngày 25/8/1945, Sài Gòn và Nam Bộ giành chính quyền. Mốc này chứng minh Tổng khởi nghĩa đã lan tới trung tâm lớn nhất ở phía Nam, hoàn chỉnh nhịp thắng lợi toàn quốc.",
      milestones: [
        "Quần chúng Sài Gòn - Gia Định xuống đường với khí thế lớn.",
        "Việt Minh và các lực lượng cách mạng tổ chức biểu tình, chiếm cơ quan trọng yếu.",
        "Phong trào Nam Bộ nối nhịp với Hà Nội và Huế, tạo thế thắng lợi trên cả ba miền.",
      ],
      methodTitle: "Cách mở rộng thắng lợi toàn quốc",
      methods: [
        "Dùng sức mạnh quần chúng đô thị để áp đảo chính quyền cũ trong lúc Nhật đã suy sụp.",
        "Kết hợp tổ chức của Việt Minh với các lực lượng yêu nước tại địa phương.",
        "Hành động đồng loạt để địch không kịp củng cố hoặc chia cắt phong trào.",
      ],
      result:
        "Thắng lợi ở Sài Gòn làm rõ tính toàn quốc của Cách mạng Tháng Tám: từ Bắc vào Nam, chính quyền lần lượt về tay nhân dân.",
      imageTitle: "Sài Gòn 25/8/1945",
      imageCaption: "Tư liệu về phong trào Nam Bộ trong cao trào Tổng khởi nghĩa.",
      imageHint: "public/images/session10/sai-gon-25-8.jpg",
    },
    {
      title: "Tuyên ngôn Độc lập tại Ba Đình",
      overview:
        "Ngày 2/9/1945 tại Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập. Đây là mốc kết tinh thắng lợi quân sự, chính trị và quần chúng của Tổng khởi nghĩa.",
      milestones: [
        "Chính phủ lâm thời ra mắt quốc dân sau khi chính quyền đã về tay nhân dân.",
        "Tuyên ngôn Độc lập tuyên bố sự ra đời của nước Việt Nam Dân chủ Cộng hòa.",
        "Thắng lợi Cách mạng Tháng Tám được xác lập trên bình diện quốc gia.",
      ],
      methodTitle: "Cách chuyển thắng lợi thành chính danh",
      methods: [
        "Biến thắng lợi giành chính quyền thành tuyên bố lập quốc trước toàn dân và thế giới.",
        "Khẳng định quyền độc lập, tự do bằng một văn kiện chính trị có giá trị pháp lý - biểu tượng.",
        "Tập hợp nhân dân quanh nhà nước mới để bước sang nhiệm vụ bảo vệ thành quả.",
      ],
      result:
        "Mốc Ba Đình khép lại chặng giành chính quyền và mở ra chặng giữ chính quyền: độc lập đã được tuyên bố, nhưng còn phải được bảo vệ bằng chính sách và thực lực.",
      imageTitle: "Ba Đình 2/9/1945",
      imageCaption: "Tư liệu về Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.",
      imageHint: "public/images/session10/ba-dinh-2-9.jpg",
    },
  ],
  session11: [
    {
      title: "Chỉ thị Kháng chiến kiến quốc",
      overview:
        "Sau ngày độc lập, chính quyền mới đối mặt cùng lúc với đói, dốt, tài chính cạn kiệt, thù trong và ngoại xâm. Chỉ thị Kháng chiến kiến quốc xác định cách giữ thành quả cách mạng.",
      milestones: [
        "Nhiệm vụ chống giặc đói, giặc dốt, giặc ngoại xâm được đặt ra cấp bách.",
        "Chính quyền cách mạng phải vừa xây dựng nhà nước, vừa chuẩn bị kháng chiến.",
        "Đường lối giữ nước được gắn với củng cố đời sống nhân dân và chính danh chính trị.",
      ],
      methodTitle: "Cách giữ chính quyền non trẻ",
      methods: [
        "Giải quyết vấn đề dân sinh trước mắt để củng cố lòng tin của nhân dân.",
        "Xây dựng bộ máy nhà nước mới, giữ trật tự và chống các lực lượng phá hoại.",
        "Chuẩn bị thực lực kháng chiến nhưng vẫn linh hoạt về sách lược ngoại giao.",
      ],
      result:
        "Mốc này chuyển trọng tâm từ 'giành' sang 'giữ': thắng lợi Cách mạng Tháng Tám chỉ bền vững nếu chính quyền mới đứng vững trước thử thách.",
      imageTitle: "Diệt giặc đói, giặc dốt",
      imageCaption: "Tư liệu về bình dân học vụ, tăng gia sản xuất và cứu đói.",
      imageHint: "public/images/session11/giac-doi-giac-dot.jpg",
    },
    {
      title: "Tổng tuyển cử bầu Quốc hội đầu tiên",
      overview:
        "Ngày 6/1/1946, Tổng tuyển cử bầu Quốc hội đầu tiên được tổ chức. Đây là cách biến chính quyền cách mạng thành một nhà nước có cơ sở pháp lý và đại diện dân chủ.",
      milestones: [
        "Nhân dân cả nước tham gia bầu Quốc hội trong bối cảnh đất nước còn nhiều khó khăn.",
        "Quốc hội đầu tiên ra đời, tạo nền tảng pháp lý cho nhà nước mới.",
        "Khối đoàn kết dân tộc được củng cố thông qua quyền làm chủ của nhân dân.",
      ],
      methodTitle: "Cách hợp pháp hóa chính quyền",
      methods: [
        "Tổ chức bầu cử phổ thông để nhân dân trực tiếp trao quyền cho nhà nước mới.",
        "Dùng thiết chế Quốc hội để thống nhất ý chí chính trị sau cách mạng.",
        "Tạo cơ sở pháp lý để đối nội ổn định và đối ngoại có vị thế hơn.",
      ],
      result:
        "Tổng tuyển cử giúp chính quyền cách mạng không chỉ có sức mạnh khởi nghĩa, mà còn có chính danh nhà nước để tiếp tục lãnh đạo đất nước.",
      imageTitle: "Tổng tuyển cử 6/1/1946",
      imageCaption: "Tư liệu về cử tri đi bỏ phiếu và xây dựng nhà nước dân chủ mới.",
      imageHint: "public/images/session11/tong-tuyen-cu.jpg",
    },
    {
      title: "Hiệp định Sơ bộ Việt - Pháp",
      overview:
        "Hiệp định Sơ bộ ngày 6/3/1946 là một sách lược ngoại giao trong tình thế chính quyền mới còn yếu, nhiều lực lượng nước ngoài hiện diện và nguy cơ chiến tranh rất gần.",
      milestones: [
        "Việt Nam cần tránh cùng lúc đối đầu với nhiều kẻ thù.",
        "Đàm phán với Pháp được dùng để đẩy bớt áp lực trước mắt và tranh thủ thời gian.",
        "Mục tiêu độc lập vẫn được giữ, nhưng cách xử lý mềm dẻo hơn về sách lược.",
      ],
      methodTitle: "Cách nhân nhượng có nguyên tắc",
      methods: [
        "Lợi dụng mâu thuẫn giữa các lực lượng bên ngoài để giảm áp lực cho chính quyền mới.",
        "Chấp nhận hòa hoãn tạm thời để chuẩn bị lực lượng lâu dài.",
        "Không đánh đổi mục tiêu độc lập dân tộc, chỉ linh hoạt về bước đi và thời điểm.",
      ],
      result:
        "Mốc này cho thấy bảo vệ thắng lợi không chỉ bằng đấu tranh vũ trang, mà còn bằng ngoại giao, thời gian và khả năng phân hóa đối phương.",
      imageTitle: "Ngoại giao 1946",
      imageCaption: "Tư liệu về sách lược hòa hoãn để chuẩn bị thực lực.",
      imageHint: "public/images/session11/ngoai-giao-1946.jpg",
    },
    {
      title: "Tạm ước Việt - Pháp",
      overview:
        "Tạm ước ngày 14/9/1946 tiếp tục đường lối hòa hoãn có nguyên tắc. Khi nguy cơ xung đột tăng cao, mục tiêu chính là kéo dài thời gian để chuẩn bị thực lực.",
      milestones: [
        "Tình hình Việt - Pháp ngày càng căng thẳng sau Hiệp định Sơ bộ.",
        "Tạm ước được ký để tiếp tục giữ một khoảng hòa hoãn cần thiết.",
        "Trong nước, chính quyền có thêm thời gian củng cố lực lượng, tổ chức và tinh thần kháng chiến.",
      ],
      methodTitle: "Cách chuẩn bị cho tình huống xấu nhất",
      methods: [
        "Tiếp tục đàm phán để tránh bị đẩy vào thế chiến tranh khi chưa chuẩn bị đủ.",
        "Dùng thời gian hòa hoãn để củng cố nhà nước, lực lượng vũ trang và hậu phương.",
        "Giữ nguyên tắc độc lập, thống nhất, nhưng mềm dẻo về hình thức thương lượng.",
      ],
      result:
        "Tạm ước thể hiện bài học lớn của giai đoạn 1945-1946: muốn giữ độc lập phải biết kết hợp chính trị, ngoại giao, quân sự và chuẩn bị lâu dài.",
      imageTitle: "Ngoại giao 1946",
      imageCaption: "Tư liệu về sách lược hòa hoãn để chuẩn bị thực lực.",
      imageHint: "public/images/session11/ngoai-giao-1946.jpg",
    },
  ],
};

function getSessionEventDetail(session: SessionBlock, event: string, index: number): SessionEventDetail {
  const detail = sessionEventDetails[session.id]?.[index];
  const slot = session.imageSlots[index % session.imageSlots.length];

  if (detail) {
    return {
      event,
      ...detail,
      imageSrc: detail.imageSrc || session.heroImage,
    };
  }

  return {
    event,
    title: event,
    overview: session.summary,
    milestones: session.keyIdeas.slice(0, 3),
    methodTitle: "Cách thực hiện",
    methods: session.outcomes.slice(0, 3),
    result: "Mốc này nằm trong mạch chính của giai đoạn và cần được liên hệ với mục tiêu học của phần này.",
    imageTitle: slot?.title || "Tư liệu sự kiện",
    imageCaption: slot?.caption || "Hình ảnh minh họa cho mốc sự kiện này.",
    imageHint: slot?.pathHint || "public/images/session-tu-lieu.jpg",
    imageSrc: slot?.src || session.heroImage,
  };
}

const uprisingEvents: UprisingEvent[] = [
  {
    id: "chuyen-huong",
    date: "1939-1941",
    phase: "Sơ khai",
    place: "Trung ương Đảng",
    title: "Chuyển hướng chiến lược",
    route: "Chiến tranh thế giới -> nhiệm vụ dân tộc",
    note: "Đảng từng bước đặt nhiệm vụ giải phóng dân tộc lên hàng đầu, chuẩn bị đường lối cho cuộc vận động cách mạng mới.",
    overview:
      "Chiến tranh thế giới thứ hai làm tình hình Đông Dương biến động sâu sắc. Trong bối cảnh Pháp tăng đàn áp, Nhật từng bước can thiệp, Đảng nhận ra nhiệm vụ cấp bách nhất không còn là các yêu sách cải cách trước mắt mà là giành độc lập dân tộc.",
    highlights: [
      "Hội nghị Trung ương 6, 7 và 8 từng bước hoàn chỉnh chủ trương chuyển hướng chiến lược.",
      "Nhiệm vụ giải phóng dân tộc được đặt lên hàng đầu, các khẩu hiệu chưa phù hợp được tạm gác.",
      "Phong trào cách mạng chuyển sang chuẩn bị lực lượng chính trị, lực lượng vũ trang và căn cứ địa.",
    ],
    implementationTitle: "Cách chuẩn bị từ sơ khai",
    implementation: [
      "Xác định đúng mâu thuẫn chủ yếu là mâu thuẫn dân tộc giữa nhân dân Việt Nam với đế quốc, phát xít.",
      "Tổ chức cơ sở bí mật, tuyên truyền cứu quốc và xây dựng hạt nhân quần chúng ở nông thôn, miền núi, đô thị.",
      "Chuẩn bị dài hơi thay vì nôn nóng khởi nghĩa khi lực lượng và thời cơ chưa đủ.",
    ],
    meaning:
      "Đây là nền móng của toàn bộ Tổng khởi nghĩa. Nếu không có chuyển hướng chiến lược sớm, các mốc sau như Việt Minh, cao trào kháng Nhật và Tân Trào sẽ thiếu đường lối thống nhất.",
    session: "Session 8",
    imageHint: "public/images/session8/can-cu-viet-bac.jpg",
  },
  {
    id: "viet-minh",
    date: "19/5/1941",
    phase: "Tập hợp lực lượng",
    place: "Pác Bó",
    title: "Mặt trận Việt Minh ra đời",
    route: "Đường lối -> mặt trận toàn dân",
    note: "Việt Minh tạo hình thức tổ chức để đoàn kết toàn dân, xây dựng cơ sở chính trị, căn cứ địa và lực lượng cứu quốc.",
    overview:
      "Mặt trận Việt Minh ra đời ngày 19/5/1941 tại Pác Bó, sau Hội nghị Trung ương 8. Đây là hình thức tổ chức phù hợp để tập hợp mọi tầng lớp yêu nước quanh mục tiêu độc lập.",
    highlights: [
      "Việt Minh đưa mục tiêu cứu nước thành khẩu hiệu dễ hiểu, dễ tham gia với đông đảo quần chúng.",
      "Các hội cứu quốc được gây dựng để tổ chức công nhân, nông dân, thanh niên, phụ nữ, trí thức và các lực lượng yêu nước.",
      "Cao Bằng - Việt Bắc trở thành không gian quan trọng để xây dựng căn cứ, cán bộ và lực lượng vũ trang ban đầu.",
    ],
    implementationTitle: "Cách tập hợp lực lượng",
    implementation: [
      "Lấy mặt trận dân tộc thống nhất làm hình thức liên minh rộng rãi, không bó hẹp trong một giai cấp hoặc một địa phương.",
      "Kết hợp tuyên truyền chính trị với xây dựng tổ chức quần chúng và tự vệ cứu quốc.",
      "Gắn cơ sở bí mật ở địa phương với căn cứ cách mạng để tạo mạng lưới chuẩn bị lâu dài.",
    ],
    meaning:
      "Việt Minh biến lòng yêu nước thành sức mạnh có tổ chức. Đây là lực lượng chính trị nòng cốt để khi thời cơ đến, quần chúng có thể nổi dậy đồng loạt.",
    session: "Session 8",
    imageHint: "public/images/session8/viet-minh.jpg",
  },
  {
    id: "nhat-dao-chinh",
    date: "9/3/1945",
    phase: "Thời cơ mở ra",
    place: "Đông Dương",
    title: "Nhật đảo chính Pháp",
    route: "Một cổ hai tròng -> kẻ thù trực tiếp là Nhật",
    note: "Nhật lật Pháp làm tình thế chính trị đảo chiều, mở ra khả năng phát động cao trào kháng Nhật cứu nước.",
    overview:
      "Ngày 9/3/1945, Nhật đảo chính Pháp và độc chiếm Đông Dương. Bộ máy Pháp bị gạt khỏi vị trí thống trị trực tiếp, còn Nhật trở thành kẻ thù chính trước mắt của nhân dân Đông Dương.",
    highlights: [
      "Tình thế một cổ hai tròng chuyển sang giai đoạn Nhật trực tiếp khống chế Đông Dương.",
      "Bộ máy cai trị cũ rối loạn, tạo khoảng trống chính trị để phong trào cách mạng phát triển nhanh hơn.",
      "Câu hỏi trung tâm lúc này là phải chuyển hướng hành động như thế nào cho kịp thời cơ.",
    ],
    implementationTitle: "Cách nắm biến động",
    implementation: [
      "Nhanh chóng xác định lại kẻ thù trực tiếp là phát xít Nhật.",
      "Không chờ tình hình ổn định mà chuẩn bị chuyển sang cao trào hành động.",
      "Biến sự khủng hoảng của đối phương thành cơ hội để mở rộng ảnh hưởng của cách mạng.",
    ],
    meaning:
      "Mốc này mở ra tình thế tiền khởi nghĩa. Đảng phải phản ứng rất nhanh, vì chỉ cần chậm nhịp là thời cơ có thể trôi qua hoặc bị lực lượng khác chiếm mất.",
    session: "Session 9",
    imageHint: "public/images/session9/nhat-dao-chinh-phap.jpg",
  },
  {
    id: "chi-thi-12-3",
    date: "12/3/1945",
    phase: "Tập dượt",
    place: "Ban Thường vụ Trung ương",
    title: "Chỉ thị hành động",
    route: "Nhận định thời cơ -> cao trào kháng Nhật",
    note: "Chỉ thị 'Nhật - Pháp bắn nhau và hành động của chúng ta' phát động cao trào kháng Nhật cứu nước, chuẩn bị trực tiếp cho khởi nghĩa.",
    overview:
      "Chỉ thị ngày 12/3/1945 trả lời trực tiếp cho tình thế sau đảo chính Nhật - Pháp. Nội dung quan trọng nhất là xác định kẻ thù chính, phát động cao trào kháng Nhật cứu nước và chuẩn bị cho khởi nghĩa khi thời cơ chín muồi.",
    highlights: [
      "Kẻ thù chính, trực tiếp trước mắt được xác định là phát xít Nhật.",
      "Cao trào kháng Nhật cứu nước phát triển với nhiều hình thức: tuyên truyền, biểu tình, phá kho thóc, xây dựng tự vệ.",
      "Phong trào phá kho thóc cứu đói gắn nhu cầu sống còn của nhân dân với hành động cách mạng.",
    ],
    implementationTitle: "Cách biến cao trào thành tập dượt",
    implementation: [
      "Đưa khẩu hiệu sát đời sống để quần chúng có lý do hành động ngay.",
      "Kết hợp đấu tranh chính trị với tự vệ vũ trang và giành quyền làm chủ ở từng nơi.",
      "Tạo trạng thái sẵn sàng để địa phương có thể chuyển từ cao trào sang khởi nghĩa khi nhận lệnh.",
    ],
    meaning:
      "Chỉ thị 12/3 là bước nối giữa chuẩn bị và hành động. Nhờ cao trào này, Tổng khởi nghĩa tháng 8 không xuất hiện đột ngột mà có lực lượng, khí thế và kinh nghiệm quần chúng phía sau.",
    session: "Session 9",
    imageHint: "public/images/session9/pha-kho-thoc.jpg",
  },
  {
    id: "tan-trao",
    date: "13-16/8/1945",
    phase: "Quyết định",
    place: "Tân Trào",
    title: "Quyết định Tổng khởi nghĩa",
    route: "Cao trào -> lệnh Tổng khởi nghĩa",
    note: "Hội nghị toàn quốc của Đảng và Quốc dân Đại hội thống nhất chủ trương phát động Tổng khởi nghĩa trước khi quân Đồng minh vào Đông Dương.",
    overview:
      "Tân Trào là nơi quyết định chuyển toàn bộ cao trào cách mạng thành Tổng khởi nghĩa. Khi Nhật đầu hàng Đồng minh, Đảng chủ trương hành động trước khi quân Đồng minh vào Đông Dương và trước khi các lực lượng khác kịp lấp khoảng trống quyền lực.",
    highlights: [
      "Hội nghị toàn quốc của Đảng họp tại Tân Trào, quyết định phát động Tổng khởi nghĩa.",
      "Ủy ban Khởi nghĩa toàn quốc được thành lập và Quân lệnh số 1 được ban bố.",
      "Quốc dân Đại hội Tân Trào thông qua chủ trương lớn và bầu Ủy ban Dân tộc Giải phóng.",
    ],
    implementationTitle: "Cách chớp thời cơ",
    implementation: [
      "Ra quyết định đúng lúc: Nhật đã đầu hàng, bộ máy địch tan rã, quân Đồng minh chưa kịp vào.",
      "Thống nhất mệnh lệnh để các địa phương hành động nhanh và đồng loạt.",
      "Kết hợp chính danh chính trị của Quốc dân Đại hội với lực lượng vũ trang và cơ sở quần chúng.",
    ],
    meaning:
      "Mốc Tân Trào biến thời cơ thành mệnh lệnh hành động. Đây là điểm phát lệnh cho chuỗi thắng lợi Thái Nguyên, Hà Nội, Huế, Sài Gòn và cả nước.",
    session: "Session 9",
    imageHint: "public/images/route/tan-trao.jpg",
  },
  {
    id: "thai-nguyen",
    date: "16/8/1945",
    phase: "Mở đầu hành động",
    place: "Thái Nguyên",
    title: "Quân giải phóng xuất phát",
    route: "Tân Trào -> Thái Nguyên",
    note: "Đội quân giải phóng tiến về Thái Nguyên, mở đầu hành động quân sự trong cao trào Tổng khởi nghĩa.",
    overview:
      "Từ căn cứ Tân Trào, lực lượng Giải phóng quân tiến về Thái Nguyên ngày 16/8/1945. Đây là bước mở đầu bằng hành động quân sự, cho thấy quyết định Tổng khởi nghĩa đã chuyển thành thực tiễn.",
    highlights: [
      "Lực lượng vũ trang cách mạng xuất phát từ căn cứ địa Việt Bắc.",
      "Thái Nguyên là hướng tiến công tiêu biểu đầu tiên sau lệnh Tổng khởi nghĩa.",
      "Tin hành động vũ trang từ căn cứ tạo khí thế cho các địa phương khác nổi dậy.",
    ],
    implementationTitle: "Cách mở đầu hành động",
    implementation: [
      "Dùng lực lượng vũ trang làm mũi nhọn tại địa bàn có điều kiện thuận lợi.",
      "Kết hợp tiến công quân sự với nổi dậy của quần chúng địa phương.",
      "Tạo hiệu ứng tâm lý rằng Tổng khởi nghĩa không còn là khẩu hiệu mà là hành động toàn quốc.",
    ],
    meaning:
      "Mốc Thái Nguyên nối căn cứ Tân Trào với các trung tâm chính trị lớn, mở nhịp cho giai đoạn giành chính quyền trong thực tế.",
    session: "Session 10",
    imageHint: "public/images/route/thai-nguyen.jpg",
  },
  {
    id: "ha-noi",
    date: "19/8/1945",
    phase: "Trung tâm Bắc Bộ",
    place: "Hà Nội",
    title: "Giành chính quyền ở trung tâm chính trị",
    route: "Thái Nguyên -> Hà Nội",
    note: "Thắng lợi ở Hà Nội tạo hiệu ứng chính trị rất lớn, cổ vũ các địa phương nổi dậy.",
    overview:
      "Ngày 19/8/1945, Hà Nội giành chính quyền. Vì đây là trung tâm chính trị lớn, thắng lợi ở Hà Nội có sức cổ vũ đặc biệt, làm nhịp Tổng khởi nghĩa lan nhanh hơn ra cả nước.",
    highlights: [
      "Quần chúng tập hợp đông đảo, biến mít tinh thành hành động cách mạng.",
      "Các lực lượng cách mạng chiếm những cơ quan trọng yếu của chính quyền cũ.",
      "Chính quyền cách mạng được thiết lập ở trung tâm chính trị quan trọng nhất miền Bắc.",
    ],
    implementationTitle: "Cách giành thắng lợi ở đô thị",
    implementation: [
      "Lấy lực lượng chính trị quần chúng làm sức ép chủ đạo.",
      "Hành động nhanh vào cơ quan đầu não khi bộ máy địch hoang mang, mất chỗ dựa.",
      "Tránh kéo dài đối đầu vũ trang không cần thiết, ưu tiên giành chính quyền bằng khí thế áp đảo.",
    ],
    meaning:
      "Thắng lợi ở Hà Nội là cú hích quyết định cho toàn quốc. Sau mốc này, nhiều địa phương có thêm niềm tin, tốc độ và lý do hành động dứt khoát.",
    session: "Session 10",
    imageHint: "public/images/route/ha-noi.jpg",
  },
  {
    id: "hue",
    date: "23/8/1945",
    phase: "Trung tâm biểu tượng",
    place: "Huế",
    title: "Giành chính quyền ở kinh đô cũ",
    route: "Hà Nội -> Huế",
    note: "Thắng lợi tại Huế đánh dấu sự sụp đổ thực tế của chế độ quân chủ phong kiến.",
    overview:
      "Ngày 23/8/1945, Huế giành chính quyền. Đây là mốc có ý nghĩa biểu tượng lớn vì Huế gắn với triều Nguyễn và quyền lực quân chủ phong kiến.",
    highlights: [
      "Phong trào quần chúng ở Huế nổi lên mạnh sau thắng lợi Hà Nội.",
      "Các cơ quan chính quyền cũ bị thay thế bởi lực lượng cách mạng.",
      "Sự thoái vị của Bảo Đại sau đó khẳng định sự chấm dứt của chế độ quân chủ.",
    ],
    implementationTitle: "Cách xử lý trung tâm biểu tượng",
    implementation: [
      "Tận dụng khí thế thắng lợi từ Hà Nội để làm lung lay bộ máy cũ.",
      "Dựa vào biểu tình chính trị lớn và sự ủng hộ của nhân dân để cô lập chính quyền phong kiến.",
      "Giành chính quyền nhanh, gọn, giảm đổ máu và giữ trật tự xã hội.",
    ],
    meaning:
      "Huế cho thấy Tổng khởi nghĩa không chỉ chiếm cơ quan hành chính, mà còn làm sụp đổ nền tảng biểu tượng của trật tự chính trị cũ.",
    session: "Session 10",
    imageHint: "public/images/route/hue.jpg",
  },
  {
    id: "sai-gon",
    date: "25/8/1945",
    phase: "Lan tới Nam Bộ",
    place: "Sài Gòn",
    title: "Khởi nghĩa thắng lợi ở Nam Bộ",
    route: "Huế -> Sài Gòn",
    note: "Phong trào ở Sài Gòn và Nam Bộ thể hiện sức lan tỏa toàn quốc của Tổng khởi nghĩa.",
    overview:
      "Ngày 25/8/1945, Sài Gòn và Nam Bộ giành chính quyền. Đây là mốc chứng minh làn sóng Tổng khởi nghĩa đã lan tới trung tâm lớn nhất phía Nam, hoàn chỉnh thế thắng lợi trên cả ba miền.",
    highlights: [
      "Quần chúng Sài Gòn - Gia Định xuống đường với khí thế lớn.",
      "Việt Minh và các lực lượng yêu nước tổ chức biểu tình, chiếm cơ quan trọng yếu.",
      "Phong trào Nam Bộ nối nhịp với Hà Nội và Huế, tạo thế thắng lợi toàn quốc.",
    ],
    implementationTitle: "Cách mở rộng thắng lợi toàn quốc",
    implementation: [
      "Dùng sức mạnh quần chúng đô thị để áp đảo chính quyền cũ trong lúc Nhật đã suy sụp.",
      "Kết hợp tổ chức của Việt Minh với các lực lượng yêu nước tại địa phương.",
      "Hành động nhanh, đồng loạt để địch không kịp củng cố hoặc chia cắt phong trào.",
    ],
    meaning:
      "Thắng lợi ở Sài Gòn làm rõ tính toàn quốc của Cách mạng Tháng Tám: từ Bắc vào Nam, chính quyền lần lượt về tay nhân dân.",
    session: "Session 10",
    imageHint: "public/images/route/sai-gon.jpg",
  },
  {
    id: "ba-dinh",
    date: "2/9/1945",
    phase: "Kết tinh thắng lợi",
    place: "Ba Đình",
    title: "Tuyên ngôn Độc lập",
    route: "Giành chính quyền -> lập quốc",
    note: "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    overview:
      "Ngày 2/9/1945 tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập. Đây là mốc kết tinh thắng lợi chính trị của Tổng khởi nghĩa và tuyên bố sự ra đời của nhà nước mới.",
    highlights: [
      "Chính phủ lâm thời ra mắt quốc dân sau khi chính quyền đã về tay nhân dân.",
      "Tuyên ngôn Độc lập tuyên bố nước Việt Nam Dân chủ Cộng hòa ra đời.",
      "Thắng lợi Cách mạng Tháng Tám được xác lập trên bình diện quốc gia và chính danh nhà nước.",
    ],
    implementationTitle: "Cách chuyển thắng lợi thành chính danh",
    implementation: [
      "Biến thắng lợi giành chính quyền thành tuyên bố lập quốc trước toàn dân và thế giới.",
      "Khẳng định quyền độc lập, tự do bằng một văn kiện chính trị có giá trị pháp lý và biểu tượng.",
      "Tập hợp nhân dân quanh nhà nước mới để bước sang nhiệm vụ bảo vệ thành quả.",
    ],
    meaning:
      "Ba Đình khép lại chặng giành chính quyền và mở ra chặng giữ chính quyền. Độc lập đã được tuyên bố, nhưng còn phải được bảo vệ bằng chính sách, đoàn kết và thực lực.",
    session: "Session 10",
    imageHint: "public/images/route/ba-dinh.jpg",
  },
  {
    id: "kien-quoc",
    date: "25/11/1945",
    phase: "Giữ thành quả",
    place: "Chính quyền mới",
    title: "Kháng chiến kiến quốc",
    route: "Lập quốc -> củng cố nhà nước",
    note: "Đảng xác định nhiệm vụ chống giặc đói, giặc dốt, giặc ngoại xâm và củng cố chính quyền cách mạng.",
    overview:
      "Sau ngày độc lập, chính quyền cách mạng non trẻ phải đối mặt với nạn đói, nạn dốt, tài chính kiệt quệ, lực lượng phản động và nguy cơ xâm lược trở lại. Chỉ thị Kháng chiến kiến quốc xác định cách giữ vững thành quả cách mạng.",
    highlights: [
      "Nhiệm vụ chống giặc đói, giặc dốt, giặc ngoại xâm được đặt ra cấp bách.",
      "Chính quyền mới tổ chức Tổng tuyển cử, xây dựng cơ sở pháp lý cho nhà nước dân chủ.",
      "Đường lối ngoại giao mềm dẻo, nhân nhượng có nguyên tắc được dùng để tranh thủ thời gian.",
    ],
    implementationTitle: "Cách giữ thành quả sau thắng lợi",
    implementation: [
      "Giải quyết dân sinh trước mắt để củng cố lòng tin của nhân dân với chính quyền mới.",
      "Xây dựng bộ máy nhà nước, tổ chức bầu cử, giữ trật tự và chống các lực lượng phá hoại.",
      "Kết hợp chính trị, ngoại giao và chuẩn bị quân sự để bảo vệ nền độc lập vừa giành được.",
    ],
    meaning:
      "Mốc này nhắc rằng Cách mạng Tháng Tám không kết thúc ở việc giành chính quyền. Thắng lợi chỉ bền vững khi nhà nước mới đủ sức nuôi dân, dạy dân, đoàn kết dân và bảo vệ độc lập.",
    session: "Session 11",
    imageHint: "public/images/route/kien-quoc.jpg",
  },
];

const flipPages: FlipPage[] = [
  {
    label: "Bìa",
    title: "Cách mạng Tháng Tám 1945",
    body: "Một mạch học tập từ chuẩn bị lực lượng, chớp thời cơ Tổng khởi nghĩa đến bảo vệ chính quyền cách mạng non trẻ.",
    bullets: ["4 giai đoạn chính", "Trục thời gian 1940-1946", "Có khung để thêm ảnh tư liệu"],
  },
  {
    label: "01",
    title: "Chuẩn bị lực lượng",
    body: "Đảng chuyển hướng chiến lược, đặt nhiệm vụ giải phóng dân tộc lên hàng đầu và xây dựng Việt Minh làm hình thức tập hợp lực lượng rộng rãi.",
    bullets: ["Việt Minh", "Căn cứ địa", "Lực lượng chính trị và vũ trang"],
  },
  {
    label: "02",
    title: "Cao trào kháng Nhật",
    body: "Sau ngày 9/3/1945, kẻ thù trực tiếp là phát xít Nhật. Cao trào kháng Nhật cứu nước tạo khí thế hành động cách mạng trên cả nước.",
    bullets: ["Chỉ thị 12/3/1945", "Phá kho thóc", "Tập dượt Tổng khởi nghĩa"],
  },
  {
    label: "03",
    title: "Từ Tân Trào đến Hà Nội",
    body: "Khi thời cơ xuất hiện, quyết định Tổng khởi nghĩa được đưa ra nhanh chóng. Hà Nội giành chính quyền ngày 19/8/1945.",
    bullets: ["Tân Trào", "Thái Nguyên", "Hà Nội 19/8"],
  },
  {
    label: "04",
    title: "Lan rộng toàn quốc",
    body: "Thắng lợi ở Huế, Sài Gòn và nhiều địa phương đưa chính quyền về tay nhân dân trong phạm vi cả nước.",
    bullets: ["Huế 23/8", "Sài Gòn 25/8", "Chính quyền về tay nhân dân"],
  },
  {
    label: "05",
    title: "Tuyên ngôn Độc lập",
    body: "Ngày 2/9/1945, nước Việt Nam Dân chủ Cộng hòa ra đời, mở ra kỷ nguyên độc lập dân tộc.",
    bullets: ["Ba Đình", "Hồ Chí Minh", "Việt Nam Dân chủ Cộng hòa"],
  },
  {
    label: "06",
    title: "Bảo vệ thành quả",
    body: "Chính quyền mới phải xử lý nhiều thách thức cùng lúc: nạn đói, nạn dốt, tài chính, ngoại xâm và các lực lượng phản động.",
    bullets: ["Kháng chiến kiến quốc", "Tổng tuyển cử", "Hòa hoãn có nguyên tắc"],
  },
  {
    label: "Kết",
    title: "Bài học cốt lõi",
    body: "Thắng lợi đến từ đường lối đúng, đại đoàn kết toàn dân, chuẩn bị lực lượng toàn diện và nghệ thuật nắm bắt thời cơ.",
    bullets: ["Đường lối đúng", "Đại đoàn kết", "Nắm thời cơ"],
  },
];

const reviewCards = [
  {
    question: "Vì sao phải chuyển hướng chiến lược giai đoạn 1939-1941?",
    answer:
      "Vì Chiến tranh thế giới thứ hai làm mâu thuẫn dân tộc trở nên gay gắt, yêu cầu cấp bách nhất là giải phóng dân tộc và giành độc lập.",
  },
  {
    question: "Chỉ thị ngày 12/3/1945 có ý nghĩa gì?",
    answer:
      "Chỉ thị xác định kẻ thù trực tiếp là phát xít Nhật, đề ra phương hướng hành động mới và thúc đẩy cao trào kháng Nhật cứu nước.",
  },
  {
    question: "Tổng khởi nghĩa đi qua các điểm chính nào?",
    answer:
      "Từ quyết định ở Tân Trào, hành động ở Thái Nguyên, thắng lợi tại Hà Nội, Huế, Sài Gòn, lan rộng cả nước và được khẳng định bằng Tuyên ngôn Độc lập ngày 2/9/1945.",
  },
  {
    question: "Nhiệm vụ trọng tâm sau ngày 2/9/1945 là gì?",
    answer:
      "Củng cố và bảo vệ chính quyền cách mạng non trẻ, chống giặc đói, giặc dốt, giặc ngoại xâm, đồng thời xây dựng cơ sở pháp lý cho nhà nước mới.",
  },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-xs font-bold uppercase tracking-[0.18em] text-stone-600 transition hover:text-red-700 dark:text-stone-300 dark:hover:text-amber-200"
    >
      {children}
    </a>
  );
}

function AuthButton({
  user,
  loading,
  onLogin,
  onLogout,
}: {
  user: User | null | undefined;
  loading: boolean;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  if (loading) {
    return (
      <div className="flex h-10 items-center gap-2 border border-stone-200 px-3 text-xs font-bold uppercase tracking-[0.14em] text-stone-500 dark:border-white/10 dark:text-stone-400">
        <CircleUserRound className="h-4 w-4" />
        Đang kiểm tra
      </div>
    );
  }

  if (user) {
    return (
      <button
        type="button"
        onClick={onLogout}
        className="flex h-10 items-center gap-2 border border-stone-200 px-3 text-xs font-bold text-stone-700 transition hover:border-red-700 hover:text-red-700 dark:border-white/10 dark:text-stone-200 dark:hover:border-amber-200 dark:hover:text-amber-200"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || "Tài khoản"} className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <CircleUserRound className="h-4 w-4" />
        )}
        <span className="hidden max-w-28 truncate lg:inline">{user.displayName || "Đã đăng nhập"}</span>
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onLogin}
      className="flex h-10 items-center gap-2 bg-red-700 px-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-800"
    >
      <LogIn className="h-4 w-4" />
      Google
    </button>
  );
}

function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section id="overview" className="relative min-h-[86vh] overflow-hidden pt-24 text-white">
      <img
        src="/images/FooterBG.png"
        alt="Không gian lịch sử Cách mạng Tháng Tám"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,12,8,0.94),rgba(29,18,12,0.74),rgba(26,20,14,0.22))]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-950/95 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(86vh-6rem)] max-w-7xl flex-col justify-center px-5 py-14 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-5xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 border border-amber-200/35 bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-100 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Lịch sử Đảng CSVN / 1940-1946
          </div>
          <h1 className="max-w-5xl text-4xl font-black uppercase leading-[1.03] md:text-6xl xl:text-7xl">
            Từ chuẩn bị lực lượng đến bảo vệ thành quả Cách mạng Tháng Tám 1945
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-stone-100 md:text-xl">
            Một không gian học tập có lộ trình: đọc nội dung theo 4 giai đoạn, theo dõi đường đi của Tổng khởi nghĩa, thêm ảnh tư liệu, lật flipbook ôn tập và hỏi chatbot sau khi đăng nhập.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#sessions"
              className="inline-flex items-center gap-2 bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-800"
            >
              Vào bài học
              <ChevronRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white backdrop-blur transition hover:bg-white/18"
            >
              Hỏi chatbot
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function OverviewBand() {
  const stats = [
    { label: "Giai đoạn", value: "4", icon: Layers3 },
    { label: "Trục học", value: "1940-1946", icon: CalendarDays },
    { label: "Mạch sự kiện", value: "11 điểm", icon: Route },
    { label: "Khung ảnh", value: "13 slot", icon: Camera },
  ];

  return (
    <section className="bg-stone-950 px-5 py-8 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border border-white/10 bg-white/[0.04] p-5">
              <Icon className="h-5 w-5 text-amber-200" />
              <p className="mt-4 text-3xl font-black">{stat.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReviewLab() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="review" className="bg-stone-100 px-5 py-16 dark:bg-stone-950 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700 dark:text-amber-200">Tương tác ôn tập</p>
            <h2 className="mt-3 text-3xl font-black uppercase text-stone-950 dark:text-white md:text-5xl">Checkpoint nhanh</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
            Các câu hỏi này dùng để người học tự kiểm tra trước khi hỏi chatbot hoặc chuẩn bị thuyết trình nhóm.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reviewCards.map((card, index) => {
            const isOpen = openIndex === index;
            return (
              <button
                key={card.question}
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className={`min-h-[260px] border p-5 text-left transition ${
                  isOpen
                    ? "border-red-700 bg-white shadow-sm dark:border-amber-200 dark:bg-white/[0.08]"
                    : "border-stone-200 bg-white/70 hover:border-red-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-amber-200/50"
                }`}
              >
                <HelpCircle className="h-6 w-6 text-red-700 dark:text-amber-200" />
                <p className="mt-4 text-lg font-black leading-tight text-stone-950 dark:text-white">{card.question}</p>
                <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  {isOpen ? card.answer : "Bấm để mở gợi ý trả lời."}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LessonFlipbook() {
  return (
    <section id="flipbook" className="bg-white px-5 py-16 dark:bg-stone-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700 dark:text-amber-200">Flipbook bài học</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-stone-950 dark:text-white md:text-5xl">
              Sổ tay lật trang
            </h2>
          </div>
          <p className="text-base leading-7 text-stone-600 dark:text-stone-300">
            Đây là structure flipbook để bạn thay ảnh minh họa sau. Mỗi trang tóm tắt một lát cắt của tiến trình từ chuẩn bị lực lượng đến bảo vệ chính quyền.
          </p>
        </div>

        <div className="overflow-hidden border border-stone-200 bg-stone-100 px-3 py-8 dark:border-white/10 dark:bg-stone-950">
          <div className="mx-auto w-full max-w-[900px] overflow-x-auto px-2 py-2">
            <HTMLFlipBook
              width={420}
              height={560}
              minWidth={300}
              maxWidth={440}
              minHeight={420}
              maxHeight={580}
              size="stretch"
              startPage={0}
              drawShadow
              flippingTime={650}
              usePortrait
              startZIndex={0}
              autoSize
              maxShadowOpacity={0.28}
              showCover
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              className="mx-auto"
              style={{ margin: "0 auto" }}
            >
              {flipPages.map((page, index) => (
                <div key={page.label} className="h-full overflow-hidden border border-stone-200 bg-white p-5 text-stone-950 shadow-sm dark:border-white/10 dark:bg-stone-900 dark:text-white sm:p-7">
                  <div className="flex h-full flex-col">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700 dark:text-amber-200">{page.label}</p>
                    <h3 className="mt-3 text-xl font-black uppercase leading-tight sm:mt-4 sm:text-3xl">{page.title}</h3>
                    <div className="my-4 aspect-[2/1] border border-dashed border-stone-300 bg-stone-100 dark:border-white/15 dark:bg-white/[0.04] sm:my-6 sm:aspect-[16/9]">
                      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                        <Image className="h-8 w-8 text-stone-400" />
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Khung ảnh trang {index + 1}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-5 text-stone-700 dark:text-stone-300 sm:text-sm sm:leading-7">{page.body}</p>
                    <div className="mt-auto space-y-1 pt-3 sm:space-y-2 sm:pt-5">
                      {page.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-center gap-2 text-[11px] font-bold leading-4 text-stone-700 dark:text-stone-200 sm:text-sm sm:leading-5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-red-700 dark:text-amber-200 sm:h-4 sm:w-4" />
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscussionFrame() {
  return (
    <section id="discussion" className="bg-stone-950 px-5 py-16 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center border border-amber-200/30 bg-amber-200/10 text-amber-100">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Khung mở rộng sau này</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-tight md:text-5xl">Dòng thảo luận và tư liệu ngoài</h2>
          <p className="mt-5 text-base leading-7 text-stone-300">
            Khu vực này được dựng sẵn để sau này gắn Threads, bài đăng nhóm, timeline xã hội hoặc nguồn ảnh bên thứ ba. Hiện tại chưa gọi API ngoài để tránh phụ thuộc key và quota.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {["Bài đăng thảo luận", "Tư liệu ảnh", "Câu hỏi nhóm", "Ghi chú giáo viên"].map((title) => (
            <div key={title} className="border border-white/10 bg-white/[0.05] p-5">
              <PanelRightOpen className="h-5 w-5 text-amber-200" />
              <p className="mt-4 text-lg font-black">{title}</p>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                Placeholder component. Có thể nối API thật bằng biến môi trường và render nội dung tại đây.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const { theme, setTheme } = useTheme();
  const [user, authLoading] = useAuthState(auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleGoogleLogin = async () => {
    setAuthError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login failed:", error);
      setAuthError("Không đăng nhập được Google. Kiểm tra Firebase Authorized domains và phương thức Google Sign-In.");
    }
  };

  const handleLogout = async () => {
    setAuthError("");
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950 dark:bg-stone-950 dark:text-white">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-stone-200 bg-white/92 backdrop-blur dark:border-white/10 dark:bg-stone-950/88">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#overview" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-red-700 text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="max-w-[220px] text-sm font-black uppercase leading-tight tracking-[0.16em] text-stone-950 dark:text-white md:max-w-none">
              Cách mạng Tháng Tám 1945
            </span>
          </a>

          <div className="hidden items-center gap-5 md:flex">
            <NavLink href="#sessions">Giai đoạn</NavLink>
            <NavLink href="#route">Hành trình</NavLink>
            <NavLink href="#review">Ôn tập</NavLink>
            <NavLink href="#flipbook">Flipbook</NavLink>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex h-10 w-10 items-center justify-center border border-stone-200 text-stone-700 transition hover:border-red-700 hover:text-red-700 dark:border-white/10 dark:text-stone-200 dark:hover:border-amber-200 dark:hover:text-amber-200"
              aria-label="Đổi giao diện sáng tối"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <AuthButton user={user} loading={authLoading} onLogin={handleGoogleLogin} onLogout={handleLogout} />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center border border-stone-200 md:hidden dark:border-white/10"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-stone-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-stone-950 md:hidden">
            <div className="flex flex-col gap-4">
              <NavLink href="#sessions">Giai đoạn</NavLink>
              <NavLink href="#route">Hành trình</NavLink>
              <NavLink href="#review">Ôn tập</NavLink>
              <NavLink href="#flipbook">Flipbook</NavLink>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="inline-flex w-fit items-center gap-2 border border-stone-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] dark:border-white/10"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Theme
                </button>
                <AuthButton user={user} loading={authLoading} onLogin={handleGoogleLogin} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        )}
      </nav>

      {authError && (
        <div className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 shadow-lg dark:border-red-400/30 dark:bg-stone-950 dark:text-red-200">
          {authError}
        </div>
      )}

      <main>
        <Hero onOpenChat={() => setChatOpen(true)} />
        <OverviewBand />
        <SessionExplorer sessions={sessions} getSessionEventDetail={getSessionEventDetail} />
        <HistoricalVietnamMap fallback={<UprisingRoute events={uprisingEvents} />} />
        <ReviewLab />
        <LessonFlipbook />
        <DiscussionFrame />
      </main>

      <footer className="border-t border-stone-200 bg-white px-5 py-8 dark:border-white/10 dark:bg-stone-950 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-stone-500 dark:text-stone-400 md:flex-row md:items-center md:justify-between">
          <span>Chủ đề: Từ chuẩn bị lực lượng đến bảo vệ thành quả Cách mạng Tháng Tám 1945</span>
          <span className="inline-flex items-center gap-2">
            <Sword className="h-4 w-4" />
            4 giai đoạn / Giáo trình Lịch sử Đảng CSVN
          </span>
        </div>
      </footer>

      <FloatingChat isOpen={chatOpen} setIsOpen={setChatOpen} user={user} onLogin={handleGoogleLogin} />
    </div>
  );
}

