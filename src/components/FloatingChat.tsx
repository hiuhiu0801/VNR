import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { BookOpen, Bot, LogIn, Send, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { db } from "../lib/firebase";
import { getChatResponse, type ChatHistoryItem } from "../lib/gemini";

type Message = {
  role: "user" | "model";
  text: string;
  createdAt?: number;
};

type FloatingChatProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  user: User | null | undefined;
  onLogin: () => Promise<void>;
};

const CHAT_STORAGE_KEY = "august1945_chat_messages";
const CHAT_DOC_ID = "august1945";

const DEFAULT_MESSAGES: Message[] = [
  {
    role: "model",
    text:
      "Xin chào! Mình là trợ lý học tập cho chủ đề Cách mạng Tháng Tám 1945. Bạn có thể hỏi theo 4 giai đoạn chính, yêu cầu lập dàn ý thuyết trình, so sánh sự kiện hoặc giải thích mốc thời gian.",
    createdAt: Date.now(),
  },
];

const suggestions = [
  "Tóm tắt giai đoạn chớp thời cơ trong 5 ý chính",
  "So sánh nhiệm vụ trước và sau ngày 2/9/1945",
  "Lập dàn ý thuyết trình về Tổng khởi nghĩa Tháng Tám",
];

export function FloatingChat({ isOpen, setIsOpen, user, onLogin }: FloatingChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return DEFAULT_MESSAGES;
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Lưu cục bộ");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!user) {
        setSaveStatus("Lưu cục bộ");
        return;
      }

      setIsHistoryLoading(true);
      try {
        const chatRef = doc(db, "users", user.uid, "chatHistories", CHAT_DOC_ID);
        const snapshot = await getDoc(chatRef);
        const data = snapshot.data();
        if (!cancelled && Array.isArray(data?.messages) && data.messages.length > 0) {
          setMessages(data.messages as Message[]);
        }
        if (!cancelled) setSaveStatus("Đã đồng bộ");
      } catch {
        if (!cancelled) setSaveStatus("Chưa lưu được cloud");
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user || isHistoryLoading) return;

    const timeout = window.setTimeout(async () => {
      try {
        const chatRef = doc(db, "users", user.uid, "chatHistories", CHAT_DOC_ID);
        await setDoc(
          chatRef,
          {
            messages,
            updatedAt: serverTimestamp(),
            owner: {
              uid: user.uid,
              displayName: user.displayName || "",
              email: user.email || "",
            },
          },
          { merge: true }
        );
        setSaveStatus("Đã đồng bộ");
      } catch {
        setSaveStatus("Chưa lưu được cloud");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [messages, user, isHistoryLoading]);

  const history: ChatHistoryItem[] = useMemo(
    () => messages.map((message) => ({ role: message.role, parts: [{ text: message.text }] })),
    [messages]
  );

  const sendMessage = async (preset?: string) => {
    const content = (preset || inputValue).trim();
    if (!content || isLoading) return;

    setInputValue("");
    setIsLoading(true);
    const nextUserMessage: Message = { role: "user", text: content, createdAt: Date.now() };
    setMessages((current) => [...current, nextUserMessage]);

    try {
      const response = await getChatResponse(content, [...history, { role: "user", parts: [{ text: content }] }]);
      setMessages((current) => [
        ...current,
        {
          role: "model",
          text: response || "Mình chưa tạo được phản hồi. Bạn thử hỏi lại ngắn hơn nhé.",
          createdAt: Date.now(),
        },
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Không rõ lỗi";
      console.error("Chat request failed:", error);
      setMessages((current) => [
        ...current,
        {
          role: "model",
          text: `Có lỗi khi kết nối mô hình hoặc kho vector store.\n\nChi tiết: ${detail}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMessages = () => {
    setMessages(DEFAULT_MESSAGES);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center bg-red-700 text-white shadow-lg transition hover:bg-red-800"
        aria-label="Mở chatbot"
      >
        <Bot className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/35 p-4 backdrop-blur-sm md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-[460px] flex-col overflow-hidden border border-stone-200 bg-white shadow-2xl dark:border-white/10 dark:bg-stone-950"
          >
            <header className="border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-700 text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-stone-950 dark:text-white">Trợ lý CMT8 1945</p>
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                      {user ? `${saveStatus} · ${user.displayName || user.email}` : "Đăng nhập Google để lưu lịch sử"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={resetMessages}
                    className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Xóa lịch sử chat"
                    title="Xóa lịch sử chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-9 w-9 items-center justify-center text-stone-500 transition hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Đóng chatbot"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {!user && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="mt-3 flex w-full items-center justify-center gap-2 bg-red-700 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-800"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập Google để lưu chat
                </button>
              )}
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    className="border border-stone-200 bg-stone-50 px-3 py-2 text-left text-xs font-semibold text-stone-600 transition hover:border-red-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[86%] border px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "border-red-700 bg-red-700 text-white"
                          : "border-stone-200 bg-stone-50 text-stone-800 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-100"
                      }`}
                    >
                      {message.role === "model" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>
                ))}

                {(isLoading || isHistoryLoading) && (
                  <div className="flex justify-start">
                    <div className="border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-stone-300">
                      {isHistoryLoading ? "Đang tải lịch sử chat..." : "Đang tra cứu tư liệu..."}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              className="border-t border-stone-200 p-3 dark:border-white/10"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Hỏi về Cách mạng Tháng Tám..."
                  className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-3 text-sm text-stone-950 outline-none transition focus:border-red-700 dark:border-white/10 dark:bg-stone-900 dark:text-white dark:focus:border-amber-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="flex h-12 w-12 shrink-0 items-center justify-center bg-red-700 text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-white/10"
                  aria-label="Gửi câu hỏi"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
