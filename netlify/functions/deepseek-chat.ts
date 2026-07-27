import type { Handler } from "@netlify/functions";

type DeepSeekRole = "system" | "user" | "assistant";

type DeepSeekMessage = {
  role: DeepSeekRole;
  content: string;
};

type DeepSeekRequest = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  systemPrompt?: string;
  prompt?: string;
  messages?: DeepSeekMessage[];
  temperature?: number;
  maxTokens?: number;
  thinking?: "enabled" | "disabled";
  reasoningEffort?: "high" | "max";
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const requestTimeoutMs = 25_000;

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: jsonHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}") as DeepSeekRequest;
    const apiKey = payload.apiKey?.trim() || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "缺少 DeepSeek API Key。" }),
      };
    }

    const prompt = payload.prompt?.trim();
    const conversation = normalizeMessages(payload.messages);
    if (!prompt && conversation.length === 0) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "请输入要发送给 DeepSeek 的内容。" }),
      };
    }

    const baseUrl = sanitizeBaseUrl(payload.baseUrl) || "https://api.deepseek.com";
    const model = payload.model?.trim() || "deepseek-v4-pro";
    const messages: DeepSeekMessage[] = [];
    if (payload.systemPrompt?.trim()) {
      messages.push({ role: "system", content: payload.systemPrompt.trim() });
    }
    if (conversation.length > 0) {
      messages.push(...conversation);
    } else if (prompt) {
      messages.push({ role: "user", content: prompt });
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), requestTimeoutMs);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      signal: abortController.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: clampNumber(payload.temperature, 0, 2, 0.7),
        max_tokens: Math.round(clampNumber(payload.maxTokens, 1, 8192, 2048)),
        thinking: { type: payload.thinking || "enabled" },
        reasoning_effort: payload.reasoningEffort || "high",
        stream: false,
      }),
    }).finally(() => clearTimeout(timeout));

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: data?.error?.message || data?.message || `DeepSeek API returned ${response.status}`,
          raw: data,
        }),
      };
    }

    const message = data?.choices?.[0]?.message;
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        model: data?.model || model,
        content: message?.content || "",
        reasoningContent: message?.reasoning_content || "",
        usage: data?.usage || null,
        raw: data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error:
          error instanceof Error && error.name === "AbortError"
            ? "DeepSeek 请求超过 25 秒，已自动取消。可能是网络连接 DeepSeek API 太慢、Key 无法访问，或接口暂时没有响应。"
            : error instanceof Error
              ? error.message
              : "DeepSeek 请求失败。",
      }),
    };
  }
};

function sanitizeBaseUrl(value?: string) {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?:\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?$/.test(trimmed)) return "";
  return trimmed;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function normalizeMessages(value: unknown): DeepSeekMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = (message as { role?: unknown }).role;
      const content = (message as { content?: unknown }).content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
      const trimmed = content.trim();
      if (!trimmed) return null;
      return { role, content: trimmed };
    })
    .filter((message): message is DeepSeekMessage => Boolean(message))
    .slice(-40);
}
