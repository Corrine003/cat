import http from "node:http";

const port = Number(process.env.DEEPSEEK_PROXY_PORT || 9998);
const defaultBaseUrl = "https://api.deepseek.com";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, "");
    return;
  }

  if (request.method !== "POST" || request.url?.split("?")[0] !== "/api/deepseek-chat") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request) || "{}");
    const apiKey = payload.apiKey?.trim() || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      sendJson(response, 400, { error: "缺少 DeepSeek API Key。" });
      return;
    }

    const conversation = normalizeMessages(payload.messages);
    const prompt = payload.prompt?.trim();
    if (!prompt && conversation.length === 0) {
      sendJson(response, 400, { error: "请输入要发送给 DeepSeek 的内容。" });
      return;
    }

    const baseUrl = sanitizeBaseUrl(payload.baseUrl) || defaultBaseUrl;
    const model = payload.model?.trim() || "deepseek-v4-pro";
    const messages = [];
    if (payload.systemPrompt?.trim()) {
      messages.push({ role: "system", content: payload.systemPrompt.trim() });
    }
    if (conversation.length > 0) {
      messages.push(...conversation);
    } else if (prompt) {
      messages.push({ role: "user", content: prompt });
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: clampNumber(payload.temperature, 0, 2, 0.7),
        max_tokens: Math.round(clampNumber(payload.maxTokens, 1, 8192, 8192)),
        thinking: { type: payload.thinking || "enabled" },
        reasoning_effort: payload.reasoningEffort || "high",
        stream: false,
      }),
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      sendJson(response, upstream.status, {
        error: data?.error?.message || data?.message || `DeepSeek API returned ${upstream.status}`,
        raw: data,
      });
      return;
    }

    const message = data?.choices?.[0]?.message;
    sendJson(response, 200, {
      model: data?.model || model,
      content: message?.content || "",
      reasoningContent: message?.reasoning_content || "",
      finishReason: data?.choices?.[0]?.finish_reason || "",
      usage: data?.usage || null,
      raw: data,
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "DeepSeek 请求失败。",
    });
  }
});

server.listen(port, () => {
  console.log(`DeepSeek local proxy ready: http://localhost:${port}/api/deepseek-chat`);
});

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, jsonHeaders);
  response.end(typeof body === "string" ? body : JSON.stringify(body));
}

function sanitizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?:\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?$/.test(trimmed)) return "";
  return trimmed;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function normalizeMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const { role, content } = message;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
      const trimmed = content.trim();
      if (!trimmed) return null;
      return { role, content: trimmed };
    })
    .filter(Boolean)
    .slice(-40);
}
