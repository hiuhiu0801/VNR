import { Blob } from "node:buffer";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function readEnvFile(path) {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const localEnv = readEnvFile(join(projectRoot, ".env.local"));
const apiKey =
  process.env.OPENAI_API_KEY ||
  process.env.VITE_LLM_API_KEY ||
  localEnv.OPENAI_API_KEY ||
  localEnv.VITE_LLM_API_KEY;
const apiBase =
  process.env.OPENAI_BASE_URL ||
  process.env.VITE_LLM_BASE_URL ||
  localEnv.OPENAI_BASE_URL ||
  localEnv.VITE_LLM_BASE_URL ||
  "https://api.openai.com/v1";

const lifecycleEvent = process.env.npm_lifecycle_event || "";
const defaultKnowledgeDir =
  lifecycleEvent === "upload:lsd-textbook"
    ? join(projectRoot, "knowledge", "lich-su-dang-full")
    : join(projectRoot, "knowledge", "august-1945");
const knowledgeDir = resolve(
  process.env.LSD_TEXTBOOK_KNOWLEDGE_DIR ||
    process.env.AUGUST1945_KNOWLEDGE_DIR ||
    process.env.HCM_KNOWLEDGE_DIR ||
    defaultKnowledgeDir
);
const uploadProfile =
  lifecycleEvent === "upload:lsd-textbook" || knowledgeDir.includes("lich-su-dang-full")
    ? "lsd-textbook"
    : "august1945";

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY or VITE_LLM_API_KEY. Set it before running this script.");
  process.exit(1);
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }

  return data;
}

async function createVectorStore(name, description) {
  return request("/vector_stores", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

async function uploadFile(filePath) {
  const form = new FormData();
  form.set("purpose", "assistants");
  form.set("file", new Blob([readFileSync(filePath)]), basename(filePath));

  return request("/files", {
    method: "POST",
    body: form,
  });
}

async function attachFile(vectorStoreId, fileId, attributes) {
  return request(`/vector_stores/${vectorStoreId}/files`, {
    method: "POST",
    body: JSON.stringify({ file_id: fileId, attributes }),
  });
}

async function getVectorStoreFile(vectorStoreId, fileId) {
  return request(`/vector_stores/${vectorStoreId}/files/${fileId}`);
}

async function waitForVectorStoreFile(vectorStoreId, fileId) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const file = await getVectorStoreFile(vectorStoreId, fileId);
    if (["completed", "failed", "cancelled"].includes(file.status)) return file;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Timed out while indexing ${fileId} in ${vectorStoreId}`);
}

function parseFrontMatter(filePath) {
  const content = readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const attributes = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || !line.includes(":")) continue;
    const index = line.indexOf(":");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (key && value) attributes[key] = value;
  }

  return attributes;
}

function listKnowledgeFiles() {
  if (!existsSync(knowledgeDir)) {
    throw new Error(`Knowledge directory not found: ${knowledgeDir}`);
  }

  return readdirSync(knowledgeDir)
    .filter((name) => [".md", ".txt", ".pdf"].includes(extname(name).toLowerCase()))
    .filter((name) => !name.includes("placeholder"))
    .filter((name) => !name.includes("report"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => join(knowledgeDir, name));
}

const augustVectorStoreId =
  process.env.AUGUST1945_VECTOR_STORE_ID ||
  process.env.VITE_AUGUST1945_VECTOR_STORE_ID ||
  localEnv.AUGUST1945_VECTOR_STORE_ID ||
  localEnv.VITE_AUGUST1945_VECTOR_STORE_ID ||
  process.env.HCM_CHAPTER3_VECTOR_STORE_ID ||
  process.env.VITE_HCM_CHAPTER3_VECTOR_STORE_ID ||
  localEnv.VITE_HCM_CHAPTER3_VECTOR_STORE_ID;

const lsdTextbookVectorStoreId =
  process.env.LSD_TEXTBOOK_VECTOR_STORE_ID ||
  process.env.VITE_LSD_TEXTBOOK_VECTOR_STORE_ID ||
  localEnv.LSD_TEXTBOOK_VECTOR_STORE_ID ||
  localEnv.VITE_LSD_TEXTBOOK_VECTOR_STORE_ID;

const existingVectorStoreId = uploadProfile === "lsd-textbook" ? lsdTextbookVectorStoreId : augustVectorStoreId;
const vectorStoreName =
  uploadProfile === "lsd-textbook"
    ? "Lich su Dang CSVN Full Textbook OCR"
    : "Cach mang Thang Tam 1945 Knowledge";
const vectorStoreDescription =
  uploadProfile === "lsd-textbook"
    ? "Full OCR Markdown chunks from Giao trinh Lich su Dang Cong san Viet Nam for broad chatbot retrieval."
    : "Giao trinh Lich su Dang CSVN, theory PDF, and Session 8-11 notes for the 1940-1946 topic.";

const vectorStore =
  existingVectorStoreId ||
  (await createVectorStore(vectorStoreName, vectorStoreDescription)).id;

console.log(`Using vector store: ${vectorStore}`);
console.log(`Upload profile: ${uploadProfile}`);
console.log(`Knowledge directory: ${knowledgeDir}`);

const files = listKnowledgeFiles();
if (files.length === 0) {
  console.log(`No uploadable knowledge files found in ${knowledgeDir}`);
  process.exit(0);
}

for (const filePath of files) {
  const defaultAttributes =
    uploadProfile === "lsd-textbook"
      ? {
          subject: "lich-su-dang",
          topic: "giao-trinh-lich-su-dang-full",
          period: "1930-2018",
          priority: "primary",
        }
      : {
          subject: "lich-su-dang",
          topic: "cach-mang-thang-tam-1945",
          period: "1940-1946",
          priority: "primary",
        };
  const attributes = { ...defaultAttributes, ...parseFrontMatter(filePath) };

  console.log(`Uploading ${basename(filePath)}...`);
  const uploaded = await uploadFile(filePath);
  const attached = await attachFile(vectorStore, uploaded.id, attributes);
  const indexed = await waitForVectorStoreFile(vectorStore, attached.id);

  console.log(`Indexed ${basename(filePath)} as ${indexed.id} (${indexed.status})`);
}

console.log("");
console.log("Done. Put this in .env.local:");
console.log(
  uploadProfile === "lsd-textbook"
    ? `VITE_LSD_TEXTBOOK_VECTOR_STORE_ID=${vectorStore}`
    : `VITE_AUGUST1945_VECTOR_STORE_ID=${vectorStore}`
);
