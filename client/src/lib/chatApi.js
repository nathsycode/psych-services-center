const DEFAULT_TIMEOUT = 15_000;
const DEV = import.meta.env.DEV;
const VITE_CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL;
const DEFAULT_INTENT = "general";

const normalizeChatResponse = (data) => {
  const payload = Array.isArray(data) ? data[0] : data;

  if (!payload) return null;

  if (typeof payload.reply === "string") {
    return payload;
  }

  if (payload.result === "error" && payload.error?.message) {
    return {
      reply:
        typeof payload.reply === "string"
          ? payload.reply
          : payload.error.message,
      intent: payload.intent || DEFAULT_INTENT,
      error: payload.error,
    };
  }

  return null;
};

export async function sendChatMessage({
  sessionId,
  message,
  messages,
  page,
  flow,
  aiUnlockReason,
  lastErrorCode,
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!VITE_CHAT_API_URL) throw new Error("Missing VITE_CHAT_API_URL");

  try {
    const res = await fetch(VITE_CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        sessionId,
        message,
        messages,
        page,
        flow,
        aiUnlockReason,
        lastErrorCode,
        timezone,
      }),
    });

    if (!res.ok) {
      throw new Error(`CHAT_API_ERROR_${res.status}`);
    }

    const data = await res.json();
    if (DEV) console.log("Raw chat API response:", data);

    const normalized = normalizeChatResponse(data);

    if (!normalized || typeof normalized.reply !== "string") {
      throw new Error("CHAT_INVALID_RESPONSE");
    }

    if (typeof normalized.intent !== "string") {
      normalized.intent = DEFAULT_INTENT;
    }

    return normalized;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("CHAT_TIMEOUT");
    }

    if (err.message === "Missing VITE_CHAT_API_URL") {
      throw new Error("CHAT_CONFIG_ERROR");
    }

    if (
      typeof err.message === "string" &&
      (err.message.startsWith("CHAT_API_ERROR_") ||
        err.message === "CHAT_INVALID_RESPONSE")
    ) {
      throw err;
    }

    throw new Error("CHAT_NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
  }
}
