const DEFAULT_TIMEOUT = 15_000;

export async function sendChatMessage({
  sessionId,
  message,
  messages,
  page,
  context
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const res = await fetch(
      "http://localhost:5678/webhook-test/chat"
      // import.meta.env.VITE_CHAT_API_URL
      , {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId,
          message,
          messages,
          page,
          context
        }),
      });

    if (!res.ok) {
      throw new Error(`Chat API error ${res.status}`);
    }

    const data = await res.json();
    console.log('Raw chat API response:', data);

    if (
      typeof data.reply !== 'string' || typeof data.intent !== 'string'
    ) {
      throw new Error('Invalid chat response shape, data');
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Chat request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

