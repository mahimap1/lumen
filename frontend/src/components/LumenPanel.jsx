import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, RotateCcw, User, Copy, Check, Zap, Code2, BookOpen, HelpCircle, X } from "lucide-react";
import { sendChatMessage } from "@/services/gemini";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: <Zap className="w-3 h-3" />, label: "Explain a concept" },
  { icon: <Code2 className="w-3 h-3" />, label: "Debug my code" },
  { icon: <BookOpen className="w-3 h-3" />, label: "Summarize notes" },
  { icon: <HelpCircle className="w-3 h-3" />, label: "Quiz me" },
];

const QUICK_PROMPT_MESSAGES = {
  "Explain a concept": "Can you explain a key concept from today's session in simple terms?",
  "Debug my code": "I have a bug in my code. Can you help me debug it?",
  "Summarize notes": "Can you summarize the key points from today's session?",
  "Quiz me": "Give me 3 active recall questions based on data structures and algorithms.",
};

export default function LumenPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: "u" + Math.random().toString(36).slice(2),
      role: "user",
      text: query,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const replyText = await sendChatMessage(
        newHistory.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          text: m.text,
        }))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: "a" + Math.random().toString(36).slice(2),
          role: "assistant",
          text: replyText,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "e" + Math.random().toString(36).slice(2),
          role: "assistant",
          text: `Something went wrong. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-" + Math.random().toString(36).slice(2),
        role: "assistant",
        text: "How can I help you today?",
      },
    ]);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="lumen-panel">
      {/* Panel Header */}
      <div className="lumen-panel-header">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-100">Lumen</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="New conversation"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            title="Close"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-4 py-5 space-y-5">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";

            return (
              <div key={message.id} className={cn("flex gap-2.5", !isAssistant && "flex-row-reverse")}>
                {isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}

                <div className={cn("group max-w-[88%]", !isAssistant && "items-end flex flex-col")}>
                  <div
                    className={cn(
                      "text-sm leading-relaxed rounded-xl px-3.5 py-2.5",
                      isAssistant
                        ? "text-zinc-200 bg-transparent"
                        : "bg-zinc-800/80 border border-zinc-700/40 text-zinc-100"
                    )}
                  >
                    <div className="whitespace-pre-wrap select-text">{message.text}</div>
                  </div>

                  {/* Copy button for assistant messages, shown on hover */}
                  {isAssistant && message.id !== "welcome" && (
                    <button
                      onClick={() => copyToClipboard(message.id, message.text)}
                      className="mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === message.id ? (
                        <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copied</span></>
                      ) : (
                        <><Copy className="w-3 h-3" /><span>Copy</span></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              </div>
              <div className="text-sm text-zinc-500 bg-transparent px-3.5 py-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "120ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "240ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Prompts — only show when fresh / no real messages yet */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-3 space-y-1">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSend(QUICK_PROMPT_MESSAGES[item.label])}
              className="w-full flex items-center gap-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/70 rounded-lg px-3 py-2 transition-colors text-left"
            >
              <span className="text-zinc-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="lumen-panel-input-area">
        <div className="relative flex items-end gap-2 bg-zinc-900/80 border border-zinc-700/50 rounded-xl focus-within:border-zinc-500 transition-colors px-3 py-2.5">
          <Textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lumen..."
            disabled={isLoading}
            className="resize-none min-h-[22px] max-h-28 border-0 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 flex-1 leading-relaxed"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-7 w-7 shrink-0 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 transition-transform active:scale-95 disabled:opacity-20 disabled:hover:bg-zinc-100"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <p className="text-[11px] text-zinc-600 mt-1.5 px-1">Shift + Enter for new line</p>
      </div>
    </div>
  );
}
