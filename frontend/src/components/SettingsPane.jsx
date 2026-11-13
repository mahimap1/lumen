import React from "react";
import { Check, Settings, X } from "lucide-react";
import { MODEL_OPTIONS } from "@/lib/models";
import UserProfileForm from "./UserProfileForm";

export default function SettingsPane({ isOpen, onClose, model, onModelChange }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-[92vw] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100">
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-sm">Settings</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close settings"
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <UserProfileForm />

          <div className="border-t border-zinc-800" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Model</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Choose which Gemini model answers your chats. The choice is saved in this browser.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {MODEL_OPTIONS.map((option) => {
              const isSelected = model === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onModelChange(option.id)}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "border-yellow-400/40 bg-yellow-400/10"
                      : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-yellow-400 bg-yellow-400" : "border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-zinc-950" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100">{option.label}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                        {option.tag}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer — room for later settings */}
        <div className="px-5 py-3 border-t border-zinc-800">
          <p className="text-[11px] text-zinc-600">More settings will appear here as Lumen grows.</p>
        </div>
      </div>
    </div>
  );
}
