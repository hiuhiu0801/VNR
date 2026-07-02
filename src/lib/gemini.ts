export type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

type ResponseContentPart = {
  type?: string;
  text?: string;
};

type ResponseOutputItem = {
  type?: string;
  content?: ResponseContentPart[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: ResponseOutputItem[];
  error?: {
    message?: string;
    type?: string;
  };
};

const SYSTEM_PROMPT = [
  "Bạn là trợ lý học tập cho chủ đề Cách mạng Tháng Tám 1945 và giáo trình Lịch sử Đảng Cộng sản Việt Nam.",
  "Ưu tiên tra cứu vector store được cung cấp trước khi trả lời.",
  "Trả lời bằng tiếng Việt, rõ ý, có cấu trúc ngắn gọn.",
  "Nếu tài liệu không đủ căn cứ, hãy nói rõ phần nào chưa tìm thấy thay vì bịa.",
].join("\n");

function cleanEnv(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function getVectorStoreIds() {
  const ids = [
    import.meta.env.VITE_HCM_CHAPTER3_VECTOR_STORE_ID,
    import.meta.env.VITE_HCM_TEXTBOOK_VECTOR_STORE_ID,
    import.meta.env.VITE_AUGUST1945_VECTOR_STORE_ID,
    import.meta.env.VITE_LSD_TEXTBOOK_VECTOR_STORE_ID,
    import.meta.env.VITE_VECTOR_STORE_ID,
  ]
    .map(cleanEnv)
    .filter((id): id is string => Boolean(id));

  return [...new Set(ids)];
}

function getMaxResults() {
  const value = Number.parseInt(import.meta.env.VITE_FILE_SEARCH_MAX_RESULTS || "6", 10);
  return Number.isFinite(value) && value > 0 ? value : 6;
}

function getConversationText(history: ChatHistoryItem[]) {
  return history
    .slice(-8)
    .map((item) => {
      const speaker = item.role === "user" ? "Người học" : "Trợ lý";
      const text = item.parts.map((part) => part.text).join("\n").trim();
      return text ? `${speaker}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function extractResponseText(data: OpenAIResponse) {
  if (data.output_text?.trim()) return data.output_text.trim();

  const parts =
    data.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content || [])
      .filter((part) => part.type === "output_text" && part.text?.trim())
      .map((part) => part.text?.trim()) || [];

  return parts.join("\n\n").trim();
}

async function parseApiError(response: Response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text) as OpenAIResponse;
    return data.error?.message || `${response.status} ${response.statusText}`;
  } catch {
    return text || `${response.status} ${response.statusText}`;
  }
}

export const getChatResponse = async (message: string, history: ChatHistoryItem[]): Promise<string> => {
  const apiKey = cleanEnv(import.meta.env.VITE_LLM_API_KEY);
  const apiBase = cleanEnv(import.meta.env.VITE_LLM_BASE_URL) || "https://api.openai.com/v1";
  const model = cleanEnv(import.meta.env.VITE_LLM_MODEL) || "gpt-4.1-mini";
  const vectorStoreIds = getVectorStoreIds();

  if (!apiKey) {
    throw new Error("Thiếu VITE_LLM_API_KEY trong .env.local. Sau khi thêm key cần restart dev server.");
  }

  if (vectorStoreIds.length === 0) {
    throw new Error("Thiếu vector store ID. Thêm VITE_HCM_CHAPTER3_VECTOR_STORE_ID hoặc VITE_HCM_TEXTBOOK_VECTOR_STORE_ID vào .env.local.");
  }

  const response = await fetch(`${apiBase.replace(/\/$/, "")}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "developer",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Lịch sử trò chuyện gần đây:\n${getConversationText(history)}\n\nCâu hỏi hiện tại:\n${message}`,
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: vectorStoreIds,
          max_num_results: getMaxResults(),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = extractResponseText(data);

  if (!text) {
    throw new Error("API trả về rỗng. Kiểm tra model, quyền API key và trạng thái indexing của vector store.");
  }

  return text;
};

export const generateImage = async (_prompt: string): Promise<string | null> => {
  return null;
};
