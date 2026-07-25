import type { Handler } from "@netlify/functions";
import { createPixelCatSvgDataUrl } from "../../src/pixel-cat";

type GenerateCatImageRequest = {
  catName?: string;
  scientificType?: string;
  mainTitle?: string;
  coreJudgment?: string;
  scores?: Record<string, number | null>;
  photoDataUrl?: string;
};

const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: jsonHeaders };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Only POST is supported." }),
    };
  }

  const payload = parseBody(event.body);
  if (!payload) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  const prompt = buildPixelCatPrompt(payload);

  try {
    const jimengImage = await callJimengCompatibleProxy(payload, prompt);
    if (jimengImage) {
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          imageUrl: jimengImage,
          provider: "jimeng",
          prompt,
        }),
      };
    }
  } catch (error) {
    console.error("Jimeng image generation failed", error);
  }

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({
      imageUrl: createPixelCatSvgDataUrl({
        name: payload.catName,
        title: payload.mainTitle,
        scores: payload.scores,
      }),
      provider: "local-preview",
      prompt,
      note: "未配置即梦接口环境变量，已返回本地像素猫预览图。",
    }),
  };
};

function parseBody(body: string | null): GenerateCatImageRequest | null {
  if (!body) return {};
  try {
    return JSON.parse(body) as GenerateCatImageRequest;
  } catch {
    return null;
  }
}

function buildPixelCatPrompt(payload: GenerateCatImageRequest) {
  const name = payload.catName || "这只猫";
  const type = payload.scientificType || "猫咪性格画像";
  const title = payload.mainTitle || "像素风猫咪";
  return [
    "生成一张正方形像素风猫咪头像。",
    `猫咪名字：${name}。`,
    `性格类型：${type}。`,
    `趣味称号：${title}。`,
    payload.coreJudgment ? `核心判断：${payload.coreJudgment}。` : "",
    "画面要求：复古像素游戏风、清晰猫脸、可爱的眼睛、上半身头像、干净背景、适合在报告卡片中叠加帽子项链饰品。",
    "不要生成任何文字、数字、水印、签名或边框。",
  ]
    .filter(Boolean)
    .join("\n");
}

async function callJimengCompatibleProxy(payload: GenerateCatImageRequest, prompt: string) {
  const endpoint = process.env.JIMENG_PROXY_URL;
  const apiKey = process.env.JIMENG_API_KEY;
  if (!endpoint || !apiKey) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image: payload.photoDataUrl,
      size: "1024x1024",
      style: "pixel_art",
    }),
  });

  if (!response.ok) {
    throw new Error(`Jimeng proxy returned ${response.status}`);
  }

  const data = await response.json();
  return normalizeImageUrl(data);
}

function normalizeImageUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  if (typeof record.imageUrl === "string") return record.imageUrl;
  if (typeof record.url === "string") return record.url;
  if (typeof record.image_url === "string") return record.image_url;
  if (typeof record.image_base64 === "string") return `data:image/png;base64,${record.image_base64}`;

  const images = record.images;
  if (Array.isArray(images)) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return normalizeImageUrl(first);
  }

  const dataField = record.data;
  if (dataField && typeof dataField === "object") return normalizeImageUrl(dataField);

  return null;
}
