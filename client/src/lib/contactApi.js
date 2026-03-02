const VITE_CONTACT_WEBHOOK_URL = import.meta.env.VITE_CONTACT_WEBHOOK_URL;
// const VITE_CONTACT_WEBHOOK_URL = import.meta.env.VITE_TEST_CONTACT_WEBHOOK_URL;

export async function submitContactForm(payload) {
  if (!VITE_CONTACT_WEBHOOK_URL) {
    throw new Error("CONTACT_CONFIG_ERROR");
  }

  const response = await fetch(VITE_CONTACT_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`CONTACT_API_ERROR_${response.status}`);
  }
}
