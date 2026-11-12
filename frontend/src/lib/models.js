// Model chooser catalog. Ids mirror the backend chat model fallback chain
// (see backend/services/chat_service.py) so either choice is valid.
export const MODEL_STORAGE_KEY = "lumen_model_v1";

export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export const MODEL_OPTIONS = [
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash Lite",
    tag: "Testing",
    description: "Cheap but capable — the everyday model."
  },
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
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
