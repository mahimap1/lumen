// Model chooser catalog. Ids mirror the backend chat model fallback chain
// (see backend/services/chat_service.py) so either choice is valid.
export const MODEL_STORAGE_KEY = "lumen_model_v1";

export const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export const MODEL_OPTIONS = [
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    tag: "Testing",
    description: "Cheap, fast and reliable — the everyday model."
  },
  {
    id: "gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    tag: "Demo",
    description: "Stronger and a bit pricier — use it for the demo."
  }
];

export function readStoredModel() {
  try {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    if (saved !== null && MODEL_OPTIONS.some((o) => o.id === saved)) {
      return saved;
    }
  } catch {}
  return DEFAULT_MODEL;
}
