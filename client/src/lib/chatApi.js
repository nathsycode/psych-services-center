const DEFAULT_TIMEOUT = 15_000;
const DEV = import.meta.env.DEV;
const VITE_CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL;

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

  if (!VITE_CHAT_API_URL) throw new Error("Missing VITE_CHAT_API_URL");

  try {
    const res = await fetch(
      VITE_CHAT_API_URL,
      // import.meta.env.VITE_CHAT_API_URL
      {
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
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`CHAT_API_ERROR_${res.status}`);
    }

    const data = await res.json();
    if (DEV) console.log("Raw chat API response:", data);

    if (typeof data.reply !== "string" || typeof data.intent !== "string") {
      throw new Error("CHAT_INVALID_RESPONSE");
    }

    return data;
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
