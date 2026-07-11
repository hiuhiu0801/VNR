import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";
import { TECHNICAL_FLIPBOOK_PAGES } from "./data/technicalFlipbookPages";
const PAGE_RATIO = 1024 / 576;
const DEFAULT_PAGES = Array.from({ length: 24 }, (_, i) => {
  const pageNum = i + 1;
  return {
    id: `page-${pageNum}`,
    src: `/images/flipbook/${pageNum}.png`,
    alt: pageNum === 1 ? "Trang bìa" : `Trang truyện ${pageNum}`,
    type: pageNum === 1 ? "cover" : "story",
  };
});

const DEFAULT_STORY_TEXTS = [
  // Trang 1 - Bìa
  `Từ chuẩn bị lực lượng đến bảo vệ thành quả Cách mạng Tháng Tám 1945
Giai đoạn 1940–1946 là một chặng đường lịch sử quan trọng của cách mạng Việt Nam. Trong thời gian này, nhân dân ta vừa chuẩn bị lực lượng, vừa chờ đợi và nắm bắt thời cơ để giành chính quyền. Sau thắng lợi của Cách mạng Tháng Tám, nhiệm vụ mới đặt ra là bảo vệ chính quyền cách mạng non trẻ. Đây là quá trình thể hiện sự lãnh đạo đúng đắn, linh hoạt và kịp thời của Đảng.`,
  // Trang 2 - Bối cảnh năm 1940
  `Từ năm 1940, Việt Nam rơi vào tình cảnh bị cả thực dân Pháp và phát xít Nhật áp bức. Đời sống nhân dân vô cùng khó khăn, kinh tế bị bóc lột nặng nề, quyền tự do dân tộc bị tước đoạt. Mâu thuẫn giữa toàn thể dân tộc Việt Nam với các thế lực thống trị ngày càng gay gắt. Trong bối cảnh đó, nhiệm vụ giải phóng dân tộc trở thành yêu cầu cấp bách nhất của cách mạng Việt Nam.`,
  // Trang 3 - Những tiếng súng báo hiệu
  `Các cuộc đấu tranh như khởi nghĩa Bắc Sơn, khởi nghĩa Nam Kỳ và binh biến Đô Lương tuy chưa giành thắng lợi, nhưng có ý nghĩa rất quan trọng. Những sự kiện này cho thấy tinh thần yêu nước và ý chí chống áp bức của nhân dân Việt Nam vẫn luôn mạnh mẽ. Đây cũng là những tiếng súng báo hiệu cho con đường đấu tranh vũ trang sau này. Từ thất bại của các phong trào ấy, cách mạng rút ra nhiều kinh nghiệm quý báu về tổ chức lực lượng và lựa chọn thời cơ.`,
  // Trang 4 - Chuẩn bị lực lượng cách mạng
  `Sau những phong trào đấu tranh đầu thập niên 1940, cách mạng Việt Nam bước vào quá trình chuẩn bị lực lượng một cách bền bỉ. Đảng chú trọng xây dựng lực lượng chính trị trong quần chúng, đồng thời phát triển lực lượng vũ trang và căn cứ địa cách mạng. Các cơ sở cách mạng được gây dựng ở nhiều địa phương, nhất là vùng nông thôn và miền núi. Sự chuẩn bị âm thầm nhưng chắc chắn này tạo nền tảng quan trọng cho cuộc Tổng khởi nghĩa sau này.`,
  // Trang 5 - Việt Minh ra đời
  `Năm 1941, Mặt trận Việt Minh được thành lập với mục tiêu đoàn kết toàn dân tộc để đánh Nhật, đánh Pháp, giành độc lập. Việt Minh không chỉ tập hợp công nhân, nông dân mà còn thu hút thanh niên, phụ nữ, trí thức, tiểu thương và nhiều tầng lớp yêu nước khác. Sự ra đời của Việt Minh giúp phong trào cách mạng có một hình thức tổ chức rộng rãi và phù hợp với yêu cầu giải phóng dân tộc. Từ đây, ngọn cờ độc lập dân tộc được giương cao và lan rộng trong nhân dân.`,
  // Trang 6 - Đoàn kết toàn dân
  `Để chuẩn bị cho cách mạng, các hội cứu quốc được tổ chức trong nhiều tầng lớp nhân dân. Nông dân, công nhân, thanh niên, phụ nữ, học sinh, trí thức đều có thể tham gia vào phong trào cứu nước bằng nhiều hình thức khác nhau. Người thì tuyên truyền, người thì nuôi giấu cán bộ, người góp lương thực, người tham gia tự vệ. Chính sức mạnh đoàn kết toàn dân đã làm cho cách mạng có cơ sở rộng lớn và ngày càng phát triển vững chắc.`,
  // Trang 7 - Xây dựng lực lượng vũ trang
  `Bên cạnh lực lượng chính trị, lực lượng vũ trang cách mạng cũng từng bước được xây dựng. Từ các đội du kích, tự vệ cứu quốc và Cứu quốc quân, cách mạng hình thành những lực lượng nòng cốt để hỗ trợ nhân dân đấu tranh. Các đội vũ trang vừa chiến đấu, vừa tuyên truyền, vừa bảo vệ căn cứ cách mạng. Đây là bước chuẩn bị cần thiết để khi thời cơ đến, nhân dân có thể vùng lên giành chính quyền.`,
  // Trang 8 - Việt Nam Tuyên truyền Giải phóng quân
  `Ngày 22/12/1944, Việt Nam Tuyên truyền Giải phóng quân được thành lập. Đây là sự kiện đánh dấu bước phát triển mới của lực lượng vũ trang cách mạng Việt Nam. Tuy lực lượng ban đầu còn nhỏ bé, nhưng có tinh thần chiến đấu cao và gắn bó mật thiết với nhân dân. Đội quân này không chỉ có nhiệm vụ chiến đấu mà còn tuyên truyền, vận động quần chúng tham gia cách mạng.`,
  // Trang 9 - Nhật đảo chính Pháp
  `Ngày 9/3/1945, Nhật đảo chính Pháp và độc chiếm Đông Dương. Sự kiện này làm bộ máy cai trị của thực dân Pháp ở Đông Dương tan rã nhanh chóng. Chính quyền tay sai rơi vào tình trạng lúng túng, xã hội có nhiều biến động lớn. Tình hình mới mở ra điều kiện thuận lợi hơn cho cách mạng Việt Nam chuyển sang giai đoạn đấu tranh mạnh mẽ hơn.`,
  // Trang 10 - Chỉ thị ngày 12/3/1945
  `Trước tình hình Nhật đảo chính Pháp, Ban Thường vụ Trung ương Đảng đã ban hành Chỉ thị “Nhật – Pháp bắn nhau và hành động của chúng ta” vào ngày 12/3/1945. Chỉ thị xác định kẻ thù trước mắt của nhân dân Đông Dương lúc này là phát xít Nhật. Đồng thời, Đảng phát động cao trào kháng Nhật cứu nước trên phạm vi rộng lớn. Đây là sự chỉ đạo kịp thời, giúp cách mạng chuyển hướng hành động phù hợp với tình hình mới.`,
  // Trang 11 - Cao trào kháng Nhật cứu nước
  `Sau Chỉ thị 12/3/1945, phong trào kháng Nhật cứu nước phát triển mạnh ở nhiều địa phương. Nhân dân đấu tranh chống Nhật và chính quyền tay sai bằng nhiều hình thức như mít tinh, biểu tình, phá kho thóc, giành chính quyền từng phần. Không khí cách mạng lan rộng từ nông thôn đến thành thị. Cao trào này là bước chuẩn bị trực tiếp cho cuộc Tổng khởi nghĩa Tháng Tám năm 1945.`,
  // Trang 12 - Phá kho thóc, cứu đói
  `Trong năm 1945, nạn đói diễn ra nghiêm trọng, khiến đời sống nhân dân vô cùng khốn khổ. Trước tình hình đó, phong trào phá kho thóc Nhật để cứu dân nghèo được phát động ở nhiều nơi. Hoạt động này có ý nghĩa thiết thực vì vừa cứu đói cho nhân dân, vừa làm suy yếu bộ máy cai trị của Nhật và tay sai. Qua phong trào, quần chúng càng tin tưởng vào cách mạng và tích cực tham gia đấu tranh.`,
  // Trang 13 - Chuẩn bị Tổng khởi nghĩa
  `Từ giữa năm 1945, cách mạng Việt Nam bước vào giai đoạn chuẩn bị trực tiếp cho Tổng khởi nghĩa. Lực lượng chính trị trong quần chúng ngày càng lớn mạnh, lực lượng vũ trang được củng cố, các căn cứ địa tiếp tục mở rộng. Những cuộc họp quan trọng được tổ chức để thống nhất chủ trương và chuẩn bị kế hoạch hành động. Tất cả đều hướng đến mục tiêu giành chính quyền khi thời cơ lịch sử xuất hiện.`,
  // Trang 14 - Thời cơ tháng Tám
  `Tháng 8/1945, phát xít Nhật đầu hàng Đồng minh, làm cho chính quyền tay sai ở Đông Dương rơi vào khủng hoảng nghiêm trọng. Trong khi đó, quân Đồng minh chưa kịp vào Đông Dương để giải giáp quân Nhật. Đây là thời cơ rất thuận lợi nhưng cũng rất ngắn ngủi đối với cách mạng Việt Nam. Nếu không hành động nhanh chóng và quyết đoán, cơ hội giành độc lập có thể bị bỏ lỡ.`,
  // Trang 15 - Lệnh Tổng khởi nghĩa
  `Trước thời cơ lịch sử, Đảng và Việt Minh quyết định phát động toàn dân Tổng khởi nghĩa. Lệnh khởi nghĩa nhanh chóng được truyền đi khắp cả nước, làm bùng lên khí thế cách mạng mạnh mẽ. Nhân dân từ thành thị đến nông thôn đồng loạt đứng lên giành chính quyền. Sức mạnh của quần chúng, kết hợp với sự chuẩn bị lâu dài trước đó, đã tạo nên thắng lợi nhanh chóng của Cách mạng Tháng Tám.`,
  // Trang 16 - Giành chính quyền trong cả nước
  `Cuộc Tổng khởi nghĩa diễn ra sôi nổi và giành thắng lợi ở nhiều địa phương. Các trung tâm lớn như Hà Nội, Huế và Sài Gòn lần lượt giành được chính quyền. Chính quyền cách mạng được thành lập từ trung ương đến địa phương, thay thế bộ máy cai trị cũ. Thắng lợi này chứng minh sức mạnh to lớn của nhân dân khi được tổ chức và lãnh đạo đúng đắn.`,
  // Trang 17 - Ngày độc lập
  `Ngày 2/9/1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập trước quốc dân đồng bào. Bản Tuyên ngôn khẳng định quyền độc lập, tự do thiêng liêng của dân tộc Việt Nam. Nước Việt Nam Dân chủ Cộng hòa ra đời, đánh dấu sự sụp đổ của chế độ thuộc địa và phong kiến ở nước ta. Từ đây, nhân dân Việt Nam bước vào một kỷ nguyên mới: kỷ nguyên độc lập dân tộc và làm chủ đất nước.`,
  // Trang 18 - Chính quyền non trẻ
  `Sau thắng lợi của Cách mạng Tháng Tám, chính quyền cách mạng phải đối mặt với muôn vàn khó khăn. Đất nước vừa thoát khỏi ách thống trị cũ nên kinh tế kiệt quệ, tài chính trống rỗng, nạn đói và nạn mù chữ còn rất nghiêm trọng. Bên cạnh đó, các thế lực ngoại xâm và phản động tìm cách chống phá chính quyền mới. Tình thế lúc này rất hiểm nghèo, thường được ví như “ngàn cân treo sợi tóc”.`,
  // Trang 19 - Diệt giặc đói
  `Để giải quyết nạn đói, Chính phủ kêu gọi nhân dân tăng gia sản xuất, thực hành tiết kiệm và giúp đỡ lẫn nhau. Các phong trào như lập hũ gạo cứu đói, nhường cơm sẻ áo, khai hoang, trồng thêm hoa màu được phát động rộng rãi. Những biện pháp này vừa giúp ổn định đời sống nhân dân, vừa củng cố niềm tin của quần chúng đối với chính quyền cách mạng. Việc chống giặc đói trở thành một nhiệm vụ cấp bách để bảo vệ thành quả độc lập.`,
  // Trang 20 - Diệt giặc dốt
  `Bên cạnh giặc đói, nạn mù chữ cũng là một khó khăn lớn của đất nước sau Cách mạng Tháng Tám. Chính phủ phát động phong trào Bình dân học vụ nhằm xóa nạn mù chữ trong nhân dân. Nhiều lớp học được mở ở làng quê, phố phường, nhà dân và đình làng, với tinh thần ai biết chữ thì dạy người chưa biết chữ. Việc học chữ không chỉ giúp nhân dân nâng cao hiểu biết mà còn giúp họ thực sự trở thành người làm chủ đất nước.`,
  // Trang 21 - Xây dựng chính quyền mới
  `Ngày 6/1/1946, cuộc Tổng tuyển cử bầu Quốc hội khóa I được tổ chức trên phạm vi cả nước. Đây là sự kiện quan trọng, thể hiện quyền làm chủ của nhân dân trong một quốc gia độc lập. Sau đó, Quốc hội và Chính phủ chính thức được thành lập, tạo cơ sở pháp lý cho chính quyền cách mạng. Việc ban hành Hiến pháp năm 1946 tiếp tục khẳng định nền tảng dân chủ của Nhà nước Việt Nam mới.`,
  // Trang 22 - Nam Bộ kháng chiến
  `Sau khi nước Việt Nam Dân chủ Cộng hòa ra đời, thực dân Pháp quay trở lại xâm lược Nam Bộ. Nhân dân Nam Bộ đã đứng lên kháng chiến để bảo vệ nền độc lập vừa giành được. Cuộc kháng chiến ở Nam Bộ thể hiện tinh thần yêu nước, ý chí kiên cường và quyết tâm không chịu mất nước một lần nữa. Đây là một phần quan trọng trong cuộc đấu tranh bảo vệ chính quyền cách mạng non trẻ.`,
  // Trang 23 - Kháng chiến kiến quốc
  `Ngày 25/11/1945, Chỉ thị “Kháng chiến kiến quốc” được ban hành, xác định những nhiệm vụ cấp bách của cách mạng sau khi giành chính quyền. Nội dung trọng tâm là củng cố chính quyền, chống thực dân Pháp xâm lược, bài trừ nội phản và cải thiện đời sống nhân dân. Chỉ thị thể hiện sự kết hợp giữa hai nhiệm vụ: vừa kháng chiến bảo vệ độc lập, vừa kiến quốc xây dựng đất nước. Đây là định hướng quan trọng giúp chính quyền cách mạng vượt qua tình thế khó khăn ban đầu.`,
  // Trang 24 - Bảo vệ thành quả cách mạng
  `Đến cuối năm 1946, chính quyền cách mạng đã từng bước được củng cố, nhân dân ngày càng tin tưởng vào chế độ mới. Dù đất nước còn rất nhiều khó khăn và nguy cơ chiến tranh lan rộng, cách mạng vẫn giữ vững được thành quả lớn nhất là nền độc lập dân tộc. Các lực lượng kháng chiến được chuẩn bị để sẵn sàng bảo vệ Tổ quốc trong tình hình mới. Thành quả của Cách mạng Tháng Tám không chỉ là giành chính quyền, mà còn là khẳng định quyền làm chủ của nhân dân Việt Nam đối với vận mệnh đất nước.`
];

const DEFAULT_AUDIO_FILES = Array.from(
  { length: 24 },
  (_, i) => `/audio/${i + 1}.mp3`
);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FlipBook = React.forwardRef((props = {}, ref) => {
  const {
    audioRef: externalAudioRef,
    audioFiles: externalAudioFiles,
    setIsPlaying,
    setIsAudioAutoPlay,
  } = props;

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const internalAudioRef = useRef(null);

  const autoPlayTimeoutRef = useRef(null);
  const isStoppingRef = useRef(false);
  const playbackSessionRef = useRef(0);
  const pendingAutoFlipRef = useRef(false);
  const restartFromPageRef = useRef(null);

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookSize, setBookSize] = useState({ width: 360, height: 640 });
  const pages = useMemo(() => DEFAULT_PAGES, []);
  const storyTexts = useMemo(() => DEFAULT_STORY_TEXTS, []);
  const audioFiles = useMemo(() => {
    if (Array.isArray(externalAudioFiles) && externalAudioFiles.length > 0) {
      return externalAudioFiles;
    }
    return DEFAULT_AUDIO_FILES;
  }, [externalAudioFiles]);

  const activeAudioRef =
    externalAudioRef?.current ? externalAudioRef : internalAudioRef;

  const clearAutoPlayTimer = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  };

  const isSessionActive = (sessionId) =>
    playbackSessionRef.current === sessionId && !isStoppingRef.current;

  const stopAudio = () => {
    const audio = activeAudioRef?.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying?.(false);
  };

  const cancelCurrentPlayback = () => {
    playbackSessionRef.current += 1;
    clearAutoPlayTimer();
    stopAudio();
  };

  const createPlaybackSession = () => {
    playbackSessionRef.current += 1;
    return playbackSessionRef.current;
  };

  const waitForAudioMetadata = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve(false);
        return;
      }

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(true);
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", handleLoaded);
        audio.removeEventListener("canplaythrough", handleLoaded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleLoaded = () => finish(true);
      const handleError = () => finish(false);

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish(false);
      }, 100);

      audio.addEventListener("loadedmetadata", handleLoaded, { once: true });
      audio.addEventListener("canplaythrough", handleLoaded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const waitForAudioEnded = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve("cancelled");
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleEnded = () => finish("ended");
      const handleError = () => finish("error");

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish("cancelled");
      }, 100);

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const getVisibleSpreadPages = (pageIndex) => {
    const lastPage = pages.length - 1;

    if (pageIndex <= 0) return [0];
    if (pageIndex >= lastPage) return [lastPage];

    const rightPage = Math.min(pageIndex + 1, lastPage);
    return [pageIndex, rightPage];
  };

  const getPageIndicatorText = (pageIndex) => {
    const visiblePages = getVisibleSpreadPages(pageIndex).map((p) => p + 1);
    return visiblePages.length === 1
      ? `Trang ${visiblePages[0]} / ${pages.length}`
      : `Trang ${visiblePages.join(", ")} / ${pages.length}`;
  };

  const getStoryTextForCurrentView = () => {
    const visiblePages = getVisibleSpreadPages(currentPage);
    return visiblePages
      .map((pageIndex) => storyTexts[pageIndex])
      .filter(Boolean)
      .join(" ");
  };

  const playSingleAudio = async (pageIndex, sessionId) => {
    const audio = activeAudioRef?.current;
    const audioFile = audioFiles?.[pageIndex] || `/audio/page${pageIndex}.mp3`;

    if (!audio || !audioFile || !isSessionActive(sessionId)) return false;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioFile;
      audio.load();

      const hasMetadata = await waitForAudioMetadata(audio, sessionId);
      if (!hasMetadata || !isSessionActive(sessionId)) return false;

      await audio.play();
      if (!isSessionActive(sessionId)) return false;

      setIsPlaying?.(true);

      const result = await waitForAudioEnded(audio, sessionId);
      return result === "ended";
    } catch (error) {
      console.warn("Audio play failed:", error);
      setIsPlaying?.(false);
      return false;
    }
  };

  const playAudioForSpread = async (pageIndex, sessionId) => {
    const spreadPages = getVisibleSpreadPages(pageIndex);

    for (const p of spreadPages) {
      if (!isSessionActive(sessionId)) return false;

      const played = await playSingleAudio(p, sessionId);
      if (!played) return false;
    }

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }

    return true;
  };

  const playSpreadOnce = async (pageIndex) => {
    cancelCurrentPlayback();
    isStoppingRef.current = false;

    const sessionId = createPlaybackSession();
    await playAudioForSpread(pageIndex, sessionId);

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }
  };

  const getNextPageForAutoPlay = (pageIndex) => {
    const lastPage = pages.length - 1;
    if (pageIndex <= 0) return 1;
    if (pageIndex >= lastPage) return lastPage;
    return Math.min(pageIndex + 2, lastPage);
  };

  const handleFlip = (e) => {
    const nextPage = e.data;
    const audio = activeAudioRef?.current;
    const wasPlaying = Boolean(audio && !audio.paused);
    const wasInternalAutoFlip = pendingAutoFlipRef.current;

    pendingAutoFlipRef.current = false;
    setCurrentPage(nextPage);

    if (wasInternalAutoFlip) return;
    if (!wasPlaying) return;

    restartFromPageRef.current = nextPage;
    cancelCurrentPlayback();

    if (!isAutoPlay) {
      void playSpreadOnce(nextPage);
    }
  };

  const startAutoPlay = async () => {
    if (isAutoPlay) return;

    setIsAudioAutoPlay?.(true);
    setIsAutoPlay(true);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;

    let pageIndex = currentPage;

    while (!isStoppingRef.current) {
      const sessionId = createPlaybackSession();
      await playAudioForSpread(pageIndex, sessionId);

      if (isStoppingRef.current) break;

      if (restartFromPageRef.current !== null) {
        pageIndex = restartFromPageRef.current;
        restartFromPageRef.current = null;
        continue;
      }

      if (pageIndex >= pages.length - 1) break;

      const nextPage = getNextPageForAutoPlay(pageIndex);

      await wait(200);
      if (isStoppingRef.current) break;

      pendingAutoFlipRef.current = true;
      flipBookRef.current?.pageFlip()?.flip(nextPage);
      pageIndex = nextPage;

      await wait(1050);
      if (isStoppingRef.current) break;
    }

    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;
    clearAutoPlayTimer();
    setIsPlaying?.(false);
  };

  const stopAutoPlay = () => {
    isStoppingRef.current = true;
    restartFromPageRef.current = null;
    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    cancelCurrentPlayback();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.warn("Fullscreen failed:", error);
    }
  };

  const goPrev = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const goNext = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const goStart = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flip(0);
  };

  useEffect(() => {
    const updateSize = () => {
      const parentWidth = containerRef.current?.clientWidth || window.innerWidth;
      const parentHeight = window.innerHeight;
      const isMobile = window.innerWidth <= 768;

      const availableWidth = Math.max(parentWidth - 32, 320);

      // Tăng chiều cao dành cho truyện, vì ảnh của bạn là ảnh dọc
      const availableHeight = parentHeight * 0.76;

      let pageWidth;

      if (isMobile) {
        pageWidth = availableWidth * 0.9;
      } else {
        // Tăng độ rộng mỗi trang, nhưng vẫn giữ tỉ lệ dọc
        pageWidth = Math.min(availableWidth / 2.25, 430);
      }

      let pageHeight = pageWidth * PAGE_RATIO;

      if (pageHeight > availableHeight) {
        pageHeight = availableHeight;
        pageWidth = pageHeight / PAGE_RATIO;
      }

      setBookSize({
        width: Math.floor(pageWidth),
        height: Math.floor(pageHeight),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      cancelCurrentPlayback();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flipNext: () => flipBookRef.current?.pageFlip()?.flipNext(),
      flipPrev: () => flipBookRef.current?.pageFlip()?.flipPrev(),
      flip: (page) => flipBookRef.current?.pageFlip()?.flip(page),
    }),
    startAutoPlay,
    stopAutoPlay,
    toggleFullscreen,
    getCurrentPage: () => currentPage,
    getTotalPages: () => pages.length,
    getCurrentStoryText: () => getStoryTextForCurrentView(),
  }));

  return (
    <div
      ref={containerRef}
      className={`flipbook-container ${isFullscreen ? "fullscreen" : ""}`}
    >
      <style>{`
        .flipbook-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 18px 20px 16px;
  background: #121212;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  color: white;
}

.flipbook-header {
  text-align: center;
  margin-bottom: 12px;
}

.flipbook-title {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 2rem;
  margin-bottom: 4px;
  background: linear-gradient(to right, #fff, #aaa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.flipbook-header p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.55 !important;
}

.flipbook-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 3000px;
  padding: 8px 0 10px;
  min-height: unset;
}

.dialectic-book {
  position: relative;
  box-shadow: 0 22px 70px rgba(0,0,0,0.75);
}

.dialectic-book::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  width: 10px;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(0,0,0,0.4) 0%,
    rgba(255,255,255,0.1) 50%,
    rgba(0,0,0,0.4) 100%
  );
  transform: translateX(-50%);
  z-index: 100;
  pointer-events: none;
}

.page {
  background: #000;
  overflow: hidden;
}

.page-inner {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
}

.page-inner::before {
  content: "";
  position: absolute;
  top: 0;
  width: 60px;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.page-left .page-inner::before {
  right: 0;
  background: linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 100%);
}

.page-right .page-inner::before {
  left: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 100%);
}

.page-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #000;
}

.flipbook-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.ui-btn {
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.88rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.ui-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
}

.ui-btn.active {
  background: #2563eb;
  border-color: #3b82f6;
}

.page-indicator {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  margin-left: 0;
  display: inline-block;
  margin-top: 6px;
}

.story-card {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
  line-height: 1.55;
  font-size: 0.9rem;
}

.story-card-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #60a5fa;
  margin-bottom: 6px;
  font-weight: 700;
}

        @media (max-width: 768px) {
          .flipbook-container {
            padding: 24px 12px;
            border-radius: 18px;
          }

          .flipbook-title {
            font-size: 1.8rem;
          }

          .flipbook-stage {
            min-height: 260px;
            padding: 12px 0;
          }

          .page-indicator {
            margin-left: 0;
            margin-top: 10px;
          }

          .flipbook-footer {
            gap: 10px;
          }

          .ui-btn {
            width: calc(50% - 8px);
            min-width: 140px;
          }
          .technical-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #020617;
  color: white;
  font-family: 'Be Vietnam Pro', system-ui, sans-serif;
}

.technical-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9) contrast(1.08);
  transform: scale(1.02);
}

.technical-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.14), transparent 30%),
    linear-gradient(90deg, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.45), rgba(2, 6, 23, 0.86));
  z-index: 1;
}

.tech-grid {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
  pointer-events: none;
}

.tech-header {
  position: absolute;
  z-index: 4;
  top: 8%;
  left: 7%;
  right: 7%;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tech-icon {
  width: 46px;
  height: 46px;
  border: 1px solid;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  box-shadow: 0 0 24px rgba(255,255,255,0.08);
}

.tech-kicker {
  margin: 0 0 6px;
  font-size: 9px;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,0.58);
  font-weight: 800;
}

.tech-header h2 {
  margin: 0;
  font-size: clamp(18px, 2.2vw, 32px);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.tech-header p {
  margin: 8px 0 0;
  font-size: clamp(10px, 1vw, 14px);
  color: rgba(255,255,255,0.76);
  line-height: 1.45;
  max-width: 520px;
}

.tech-tags {
  position: absolute;
  z-index: 4;
  left: 7%;
  bottom: 22%;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tags span {
  font-size: 10px;
  padding: 7px 10px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.86);
}

.tech-metrics {
  position: absolute;
  z-index: 4;
  left: 7%;
  right: 7%;
  bottom: 7%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.tech-card {
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}

.tech-card span {
  display: block;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.48);
  margin-bottom: 5px;
}

.tech-card strong {
  font-size: 13px;
  letter-spacing: -0.02em;
}

.tech-map-node {
  position: absolute;
  z-index: 4;
  right: 10%;
  top: 38%;
  width: 82px;
  height: 82px;
  border: 1px solid;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(2, 6, 23, 0.38);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 40px rgba(255,255,255,0.08);
}

.tech-map-node::before,
.tech-map-node::after {
  content: "";
  position: absolute;
  inset: -14px;
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: inherit;
}

.tech-map-node::after {
  inset: -28px;
  opacity: 0.5;
}

.tech-map-node div {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 24px currentColor;
}

.tech-footer-line {
  position: absolute;
  z-index: 5;
  left: 7%;
  right: 7%;
  bottom: 4%;
  height: 2px;
  opacity: 0.9;
  box-shadow: 0 0 18px currentColor;
}             
        }
      `}</style>

      {!externalAudioRef && <audio ref={internalAudioRef} preload="auto" />}

      <div className="flipbook-header">
        <h1 className="flipbook-title">Cách mạng Tháng Tám 1945</h1>
        <p style={{ opacity: 0.7 }}>
          Sử dụng nút cuộn hoặc click để lật trang
        </p>
        <span className="page-indicator">{getPageIndicatorText(currentPage)}</span>
      </div>

      <div className="flipbook-stage">
        <HTMLFlipBook
          width={bookSize.width}
          height={bookSize.height}
          size="fixed"
          minWidth={260}
          maxWidth={520}
          minHeight={420}
          maxHeight={820}
          usePortrait={false}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          onFlip={handleFlip}
          className="dialectic-book"
          ref={flipBookRef}
          showCover={true}
          maxShadowOpacity={0.5}
        >
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={`page ${index % 2 === 0 ? "page-right" : "page-left"}`}
            >
              <div className="page-inner">
                <img
                  src={page.src}
                  alt={page.alt}
                  className="page-image"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flipbook-footer">
        <button className="ui-btn" onClick={goPrev}>
          ← Trang trước
        </button>
        <button className="ui-btn" onClick={() => void playSpreadOnce(currentPage)}>
          Phát Audio
        </button>
        <button
          className={`ui-btn ${isAutoPlay ? "active" : ""}`}
          onClick={() => {
            if (isAutoPlay) {
              stopAutoPlay();
            } else {
              void startAutoPlay();
            }
          }}
        >
          {isAutoPlay ? "Dừng tự động" : "Tự động lật + Audio"}
        </button>
        <button className="ui-btn" onClick={goNext}>
          Trang sau →
        </button>
        <button className="ui-btn" onClick={goStart}>
          Về trang đầu
        </button>
        <button className="ui-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        </button>
      </div>

      <div className="story-card">
        <div className="story-card-label">Nội dung từng trang</div>
        <div>{getStoryTextForCurrentView()}</div>
      </div>
    </div>
  );
});

export default FlipBook;
