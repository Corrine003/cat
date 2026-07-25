import type { Handler } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { createPixelCatSvgDataUrl } from "../../src/pixel-cat";

type GenerateCatImageRequest = {
  authCode?: string;
  catName?: string;
  scientificType?: string;
  mainTitle?: string;
  coreJudgment?: string;
  scores?: Record<string, number | null>;
  photoDataUrl?: string;
};

type ImageGenerationRecord = {
  code: string;
  imageCreditsTotal: 1;
  imageCreditsUsed: 0 | 1;
  imageUrl?: string;
  provider?: string;
  prompt?: string;
  generatedAt?: string;
  updatedAt: string;
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
  const authCode = normalizeAuthCode(payload.authCode);
  if (!authCode) {
    return {
      statusCode: 401,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "缺少授权码，无法生成图片。" }),
    };
  }

  if (authCode === "DEMO-PREVIEW") {
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
        remainingGenerations: 1,
        prompt,
        note: "演示模式不会消耗授权码生图额度。",
      }),
    };
  }

  const store = getStore("cat-image-generations");
  const recordKey = `auth-code:${authCode}`;
  const existingRecord = await getGenerationRecord(store, recordKey, authCode);

  if (existingRecord.imageCreditsUsed >= existingRecord.imageCreditsTotal) {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        imageUrl: existingRecord.imageUrl,
        provider: existingRecord.provider ?? "stored",
        alreadyGenerated: true,
        remainingGenerations: 0,
        note: "这个授权码已使用过一次 AI 生图。如需重新生成，请联系官方客服。",
      }),
    };
  }

  try {
    const generatedImage = await callArkImageGeneration(payload, prompt);
    if (generatedImage) {
      await store.setJSON(recordKey, {
        ...existingRecord,
        imageCreditsUsed: 1,
        imageUrl: generatedImage,
        provider: "ark-seedream",
        prompt,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies ImageGenerationRecord);

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({
          imageUrl: generatedImage,
          provider: "ark-seedream",
          remainingGenerations: 0,
          prompt,
          note: "已生成像素猫底图。本授权码的 AI 生图额度已使用。",
        }),
      };
    }
  } catch (error) {
    console.error("Ark image generation failed", error);
  }

  const previewImage = createPixelCatSvgDataUrl({
    name: payload.catName,
    title: payload.mainTitle,
    scores: payload.scores,
  });

  if (process.env.CONSUME_LOCAL_PREVIEW_CREDIT === "true") {
    await store.setJSON(recordKey, {
      ...existingRecord,
      imageCreditsUsed: 1,
      imageUrl: previewImage,
      provider: "local-preview",
      prompt,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies ImageGenerationRecord);
  }

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({
      imageUrl: previewImage,
      provider: "local-preview",
      remainingGenerations: process.env.CONSUME_LOCAL_PREVIEW_CREDIT === "true" ? 0 : 1,
      prompt,
      note: process.env.CONSUME_LOCAL_PREVIEW_CREDIT === "true"
        ? "未配置 AI 生图接口，已返回本地预览图并消耗本授权码生图额度。"
        : "未配置 AI 生图接口环境变量，已返回本地像素猫预览图，未消耗授权码生图额度。",
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

function normalizeAuthCode(code: string | undefined) {
  return code?.trim().toUpperCase() ?? "";
}

async function getGenerationRecord(
  store: ReturnType<typeof getStore>,
  key: string,
  code: string,
): Promise<ImageGenerationRecord> {
  const stored = await store.get(key, { type: "json" });
  if (isGenerationRecord(stored)) return stored;

  return {
    code,
    imageCreditsTotal: 1,
    imageCreditsUsed: 0,
    updatedAt: new Date().toISOString(),
  };
}

function isGenerationRecord(value: unknown): value is ImageGenerationRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ImageGenerationRecord>;
  return typeof record.code === "string" && record.imageCreditsTotal === 1;
}

function buildPixelCatPrompt(payload: GenerateCatImageRequest) {
  const name = payload.catName || "这只猫";
  const type = payload.scientificType || "猫咪性格画像";
  const title = payload.mainTitle || "像素风猫咪";
  return [
    "请根据参考照片生成一张正方形像素风猫咪头像。",
    "先识别并提取照片中的猫咪主体，把猫咪摆正为正面或轻微三分之二正面的头像构图。",
    "保留这只猫的真实花色、耳朵形状、脸部斑纹、眼睛颜色和明显识别特征。",
    "将照片中的真实猫转换为复古像素游戏风插画，不要变成普通卡通或写实照片。",
    `猫咪名字：${name}。`,
    `性格类型：${type}。`,
    `趣味称号：${title}。`,
    payload.coreJudgment ? `核心判断：${payload.coreJudgment}。` : "",
    "画面要求：16-bit/32-bit 像素风、清晰猫脸、上半身头像、居中构图、边缘干净、背景简洁、适合在报告卡片中叠加帽子项链饰品。",
    "如果参考照片里猫咪姿态歪斜、侧身或被遮挡，请自动校正为更适合头像的正面姿态。",
    "不要生成任何文字、数字、水印、签名或边框。",
  ]
    .filter(Boolean)
    .join("\n");
}

async function callArkImageGeneration(payload: GenerateCatImageRequest, prompt: string) {
  const endpoint = process.env.ARK_IMAGE_ENDPOINT || "https://ark.cn-beijing.volces.com/api/v3/images/generations";
  const apiKey = process.env.ARK_API_KEY || process.env.JIMENG_API_KEY;
  const model = process.env.ARK_IMAGE_MODEL || "doubao-seedream-4-5-251128";
  if (!endpoint || !apiKey) return null;

  const requestBody: Record<string, unknown> = {
    model,
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: process.env.ARK_IMAGE_SIZE || "2K",
    stream: false,
    watermark: process.env.ARK_IMAGE_WATERMARK === "true",
  };

  if (payload.photoDataUrl) {
    requestBody.image = payload.photoDataUrl;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Ark image generation returned ${response.status}: ${message}`);
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
  if (typeof record.b64_json === "string") return `data:image/png;base64,${record.b64_json}`;

  const images = record.images;
  if (Array.isArray(images)) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return normalizeImageUrl(first);
  }

  const dataField = record.data;
  if (Array.isArray(dataField)) {
    const first = dataField[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") return normalizeImageUrl(first);
  }
  if (dataField && typeof dataField === "object") return normalizeImageUrl(dataField);

  return null;
}
