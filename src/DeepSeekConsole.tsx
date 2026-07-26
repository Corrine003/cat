import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Copy, Loader2, Send, Trash2 } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type DeepSeekResponse = {
  model?: string;
  content?: string;
  reasoningContent?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
  error?: string;
  raw?: unknown;
};

export default function DeepSeekConsole() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("deepseek-console-key") || "");
  const [messages, setMessages] = useState<ChatMessage[]>(() => readSavedMessages());
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [model, setModel] = useState("deepseek-v4-pro");
  const [thinking, setThinking] = useState<"enabled" | "disabled">("enabled");
  const [reasoningEffort, setReasoningEffort] = useState<"high" | "max">("high");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState("你是一个严谨、直接、可执行的中文助手。");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<DeepSeekResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");

  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const usageLine = useMemo(() => {
    if (!result?.usage) return "";
    const input = result.usage.prompt_tokens ?? "-";
    const output = result.usage.completion_tokens ?? "-";
    const total = result.usage.total_tokens ?? "-";
    return `输入 ${input} / 输出 ${output} / 总计 ${total} tokens`;
  }, [result]);

  async function callDeepSeek(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setResult(null);
    localStorage.setItem("deepseek-console-key", apiKey);
    const userMessage: ChatMessage = { role: "user", content: prompt.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    saveMessages(nextMessages);
    setPrompt("");

    try {
      const response = await fetch("/api/deepseek-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          baseUrl,
          model,
          thinking,
          reasoningEffort,
          temperature,
          maxTokens,
          systemPrompt,
          prompt,
          messages: nextMessages,
        }),
      });
      const data = (await response.json()) as DeepSeekResponse;
      if (!response.ok) throw new Error(data.error || `请求失败：${response.status}`);
      setResult(data);
      const assistantMessage: ChatMessage = { role: "assistant", content: data.content || "" };
      const updatedMessages = data.content ? [...nextMessages, assistantMessage] : nextMessages;
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setStatus("ready");
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "请求失败" });
      setMessages(messages);
      saveMessages(messages);
      setPrompt(userMessage.content);
      setStatus("error");
    }
  }

  async function copyResult() {
    const text = latestAssistant?.content || result?.content || "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  function clearConversation() {
    setMessages([]);
    setResult(null);
    setStatus("idle");
    localStorage.removeItem("deepseek-console-messages");
  }

  return (
    <main className="deepseek-page">
      <section className="deepseek-shell">
        <header className="deepseek-header">
          <a href="/" className="secondary-button">
            <ArrowLeft size={17} />
            返回猫格
          </a>
          <div>
            <p className="eyebrow">DeepSeek V4 Pro Console</p>
            <h1>DeepSeek 临时调度台</h1>
            <p>只用于本地/临时调试。API Key 会发到本项目的后端函数代理，不会写进前端代码。</p>
          </div>
        </header>

        <form className="deepseek-grid" onSubmit={callDeepSeek}>
          <aside className="deepseek-settings panel">
            <label>
              <span>API Key</span>
              <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-..." type="password" />
            </label>
            <label>
              <span>Base URL</span>
              <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
            </label>
            <label>
              <span>模型</span>
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                <option value="deepseek-v4-pro">deepseek-v4-pro</option>
                <option value="deepseek-v4-flash">deepseek-v4-flash</option>
              </select>
            </label>
            <div className="deepseek-two">
              <label>
                <span>Thinking</span>
                <select value={thinking} onChange={(event) => setThinking(event.target.value as "enabled" | "disabled")}>
                  <option value="enabled">enabled</option>
                  <option value="disabled">disabled</option>
                </select>
              </label>
              <label>
                <span>Effort</span>
                <select value={reasoningEffort} onChange={(event) => setReasoningEffort(event.target.value as "high" | "max")}>
                  <option value="high">high</option>
                  <option value="max">max</option>
                </select>
              </label>
            </div>
            <div className="deepseek-two">
              <label>
                <span>温度</span>
                <input type="number" min="0" max="2" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
              </label>
              <label>
                <span>最大输出</span>
                <input type="number" min="1" max="8192" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} />
              </label>
            </div>
          </aside>

          <section className="deepseek-workbench panel">
            <div className="deepseek-chat-head">
              <strong>连续对话</strong>
              <button className="secondary-button" type="button" onClick={clearConversation} disabled={messages.length === 0 || status === "loading"}>
                <Trash2 size={16} />
                清空
              </button>
            </div>
            <div className="deepseek-chat-log">
              {messages.length === 0 ? (
                <p className="deepseek-empty">还没有对话。发送第一句话后，后续请求会自动带上历史消息。</p>
              ) : (
                messages.map((message, index) => (
                  <article className={`deepseek-message ${message.role}`} key={`${message.role}-${index}`}>
                    <span>{message.role === "user" ? "你" : "DeepSeek"}</span>
                    <p>{message.content}</p>
                  </article>
                ))
              )}
            </div>
            <label>
              <span>System Prompt</span>
              <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={4} />
            </label>
            <label>
              <span>用户输入</span>
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={9} placeholder="写下你要临时调度 DeepSeek V4 Pro 做的事情..." />
            </label>
            <button className="primary-button full deepseek-send" disabled={status === "loading" || !prompt.trim()}>
              {status === "loading" ? <Loader2 className="spin-icon" size={18} /> : <Send size={18} />}
              {status === "loading" ? "正在请求 DeepSeek" : "发送到 DeepSeek V4 Pro"}
            </button>
          </section>
        </form>

        <section className={`deepseek-result panel ${status}`}>
          <div className="deepseek-result-head">
            <div>
              <strong>{status === "error" ? "请求失败" : "输出结果"}</strong>
              <span>{result?.model || model}{usageLine ? ` · ${usageLine}` : ""}</span>
            </div>
            <button className="secondary-button" onClick={copyResult} disabled={!latestAssistant?.content && !result?.content}>
              <Copy size={16} />
              复制最后回答
            </button>
          </div>
          {result?.reasoningContent && (
            <details className="deepseek-reasoning">
              <summary>查看 reasoning_content</summary>
              <pre>{result.reasoningContent}</pre>
            </details>
          )}
          <pre className="deepseek-output">{result?.error || result?.content || "还没有输出。"}</pre>
        </section>
      </section>
    </main>
  );
}

function readSavedMessages(): ChatMessage[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("deepseek-console-messages") || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((message): message is ChatMessage => {
      return (
        message &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
      );
    });
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem("deepseek-console-messages", JSON.stringify(messages.slice(-40)));
}
