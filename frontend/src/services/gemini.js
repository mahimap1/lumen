const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-flash-lite-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;


/**
 * Send messages to Gemini Flash Lite (cheap testing tier)
 * @param {Array<{role: 'user'|'model', text: string}>} messages 
 * @param {string} systemPrompt 
 * @returns {Promise<string>}
 */
export async function sendChatMessage(messages, systemPrompt = "You are Lumen, an intelligent, helpful, and concise study companion and pair programmer. You provide clear explanations, well-formatted code snippets, and insightful answers.") {
  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.text || msg.content || "" }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.find((p) => p.text);
    return textPart?.text || "No response received from model.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
