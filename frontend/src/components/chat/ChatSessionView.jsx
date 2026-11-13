import React, { useRef, useState } from "react";
import MessageScroller from "./MessageScroller";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TopicPicker from "./TopicPicker";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { streamSessionMessage } from "@/services/api";
import { LumenOrbSphere } from "../LumenOrb";

export default function ChatSessionView({
  session,
  track,
  tracks = [],
  model = null,
  onOpenVisualizer,
  onAddWidget,
  onUpdateSession,
  onDeleteSession
}) {
  // Session messages are the single source of truth; the parent owns their persistence,
  // so local copies cannot drift out of sync with the saved session.
  const messages = session?.messages ?? [];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserText, setLastUserText] = useState("");
  const abortRef = useRef(null);

  // Strip leading emoji from title if any
  const cleanTitle = (session?.title || "Study Session")
    .replace(/^[\p{Emoji}\u2000-\u3300\s]+/gu, "")
    .trim() || session?.title || "Study Session";

  const handleSend = (overrideText = null) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isLoading) return;
    setInput("");
    runSend(textToSend, messages);
  };

  // Re-run the last turn after a failure. Drops the trailing user bubble so the
  // retried turn does not duplicate it in the transcript.
  const handleRetry = () => {
    if (isLoading || !lastUserText) return;
    const base =
      messages.length && messages[messages.length - 1].role === "user"
        ? messages.slice(0, -1)
        : messages;
    runSend(lastUserText, base);
  };

  const runSend = async (textToSend, baseMessages) => {
    const userMsg = { id: `u-${Date.now()}`, role: "user", content: textToSend };
    let thread = [...baseMessages, userMsg];
    let assistantMsg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: "",
      tool_executions: [],
      widgets: [],
      engine: "gemini"
    };
    thread = [...thread, assistantMsg];

    setError(null);
    setLastUserText(textToSend);
    setIsLoading(true);
    if (onUpdateSession) onUpdateSession(session.id, { messages: thread });

    // Replace the trailing streaming assistant message with an updated copy.
    const commit = (patch) => {
      assistantMsg = { ...assistantMsg, ...patch };
      thread = [...thread.slice(0, -1), assistantMsg];
      if (onUpdateSession) onUpdateSession(session.id, { messages: thread });
    };

    // Drop the trailing placeholder bubble. Used when a turn fails before any
    // content arrives, so no empty message is left in the transcript.
    const dropPlaceholder = () => {
      thread = thread.slice(0, -1);
      if (onUpdateSession) onUpdateSession(session.id, { messages: thread });
    };

    // Coalesce token deltas into one state update per animation frame.
    let pending = "";
    let flushScheduled = false;
    let failed = false;
    const flush = () => {
      flushScheduled = false;
      if (pending) {
        commit({ content: assistantMsg.content + pending });
        pending = "";
      }
    };
    const appendDelta = (text) => {
      pending += text;
      if (!flushScheduled) {
        flushScheduled = true;
        requestAnimationFrame(flush);
      }
    };

    // Surface a failure as a banner rather than an assistant message, so it is
    // never persisted into the transcript or replayed as model history.
    const fail = (message) => {
      failed = true;
      flush();
      if (assistantMsg.content) {
        commit({ content: assistantMsg.content });
      } else {
        dropPlaceholder();
      }
      setError(message);
    };

    const addWidgetToWorkspace = (w) => {
      if (!onAddWidget) return;
      onAddWidget({
        id: w.id,
        title: w.title,
        desc: w.explanation || w.concept,
        topic: w.concept,
        html: w.html_code || "",
        html_code: w.html_code || "",
        trackId: session.trackId,
        trackCode: track?.code || "CMSC",
        trackTag: track?.tagColor || "blue",
        trackType: track?.type || "course",
        engine: "Interactive HTML/CSS/JS",
        sessionId: session.id,
        createdAt: Date.now()
      });
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const courseContext = track ? `${track.code} ${track.name}` : cleanTitle;
      const history = baseMessages.map(({ role, content }) => ({ role, content }));

      await streamSessionMessage(
        textToSend,
        history,
        courseContext,
        model,
        (event) => {
          if (failed) return;
          if (event.type === "delta") {
            appendDelta(event.text || "");
          } else if (event.type === "tool") {
            flush();
            commit({ tool_executions: [...assistantMsg.tool_executions, event] });
          } else if (event.type === "widget" && event.widget) {
            flush();
            commit({ widgets: [...assistantMsg.widgets, event.widget] });
            addWidgetToWorkspace(event.widget);
          } else if (event.type === "error") {
            fail(event.message || "Something went wrong. Please try again.");
          }
        },
        controller.signal
      );

      flush();
      if (!failed && !assistantMsg.content) {
        commit({ content: "I wasn't able to put together a response for that. Try rephrasing your question." });
      }
    } catch {
      flush();
      if (controller.signal.aborted) {
        // User stopped generation — keep whatever streamed, no error banner.
        if (assistantMsg.content) commit({ content: assistantMsg.content });
        else dropPlaceholder();
      } else {
        fail("Sorry, I couldn't reach the server. Check that the backend is running, then try again.");
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClearHistory = () => {
    if (!window.confirm("Clear this conversation? The messages will be removed.")) return;
    setError(null);
    const cleared = [
      {
        id: `reinit-${Date.now()}`,
        role: "assistant",
        content: `Conversation cleared. Ready for your questions on **${cleanTitle}**!`,
        tool_executions: [],
        widgets: []
      }
    ];
    if (onUpdateSession) {
      onUpdateSession(session.id, { messages: cleared });
    }
  };

  const handleDeleteSession = () => {
    if (!session || !onDeleteSession) return;
    if (window.confirm(`Delete "${cleanTitle}"? This cannot be undone.`)) {
      onDeleteSession(session.id);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Select a session or start a new Lumen session.
      </div>
    );
  }

  // A reply is "still starting" while the trailing assistant message has no
  // content yet — then we show the typing dots instead of an empty bubble.
  const lastMsg = messages[messages.length - 1];
  const showTyping =
    isLoading &&
    (!lastMsg ||
      lastMsg.role !== "assistant" ||
      (!lastMsg.content &&
        !(lastMsg.tool_executions && lastMsg.tool_executions.length) &&
        !(lastMsg.widgets && lastMsg.widgets.length)));

  const handleSelectTrack = (trackId) => {
    if (!onUpdateSession || !session) return;
    const selected = tracks.find((t) => t.id === trackId);
    if (!selected) return;

    const newTitle = `${selected.code} · ${selected.name}`;
    const newGreeting = `Welcome! Topic updated to **${newTitle}**.\n\nAsk me any question about concepts, requirements, or career outcomes for this topic.`;

    const updatedMessages = (messages.length <= 1)
      ? [
          {
            id: `init-${Date.now()}`,
            role: "assistant",
            content: newGreeting,
            engine: "gemini",
            tool_executions: [],
            widgets: []
          }
        ]
      : messages;

    onUpdateSession(session.id, {
      trackId: selected.id,
      title: newTitle,
      messages: updatedMessages
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950/40 relative overflow-hidden">
      {/* Centered Top Header Bar */}
      <header className="flex-none px-4 sm:px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between gap-3 relative z-10">
        {/* Left: spacer to keep the title visually centered */}
        <div className="w-7 flex-shrink-0" aria-hidden="true" />

        {/* Center: Current topic (click to switch) */}
        <div className="flex items-center justify-center min-w-0 mx-auto">
          <TopicPicker
            title={cleanTitle}
            track={track}
            tracks={tracks}
            selectedTrackId={session?.trackId}
            onSelectTrack={handleSelectTrack}
          />
        </div>

        {/* Right: chat options */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                aria-label="Chat options"
                title="Chat options"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-zinc-900 border-zinc-800 text-zinc-200 shadow-2xl p-1 rounded-xl"
            >
              <DropdownMenuItem
                onClick={handleClearHistory}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-2 hover:bg-zinc-800 focus:bg-zinc-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear chat</span>
              </DropdownMenuItem>
              {onDeleteSession && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                  <DropdownMenuItem
                    onClick={handleDeleteSession}
                    className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs flex items-center gap-2 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete chat</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Conversation Scroller with glowing Lumen Orb anchored to the left */}
      <MessageScroller className="flex-1">
        <div className="flex gap-4 sm:gap-6 items-start w-full">
          {/* Glowing 3D Lumen Orb on the left of the messages */}
          <div className="sticky top-2 pt-1 flex-shrink-0 hidden sm:block animate-in fade-in duration-500">
            <LumenOrbSphere size={44} />
          </div>

          {/* Messages Column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Empty state — fresh session */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center animate-in fade-in duration-500">
                <p className="text-zinc-300 text-lg font-semibold">What would you like to explore?</p>
                <p className="text-zinc-500 text-sm max-w-xs">
                  Ask me about courses, prerequisites, career outcomes, or anything else on your mind.
                </p>
              </div>
            )}

            {messages.map((m, idx) => {
              if (isLoading && showTyping && idx === messages.length - 1) return null;
              return (
                <ChatMessage
                  key={m.id}
                  message={m}
                  onOpenVisualizer={onOpenVisualizer}
                />
              );
            })}

            {/* Typing indicator — shown until the reply starts streaming */}
            {isLoading && showTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className="rounded-2xl rounded-bl-sm bg-zinc-900/90 border border-zinc-800/80 px-4 py-3.5 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MessageScroller>

      {/* Fixed Bottom Input Bar (ChatGPT / Gemini dock) */}
      <div className="flex-none bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-3">
        {error && (
          <div className="w-full max-w-3xl mx-auto px-4 mb-2.5">
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200 animate-in fade-in"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-snug">{error}</span>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isLoading || !lastUserText}
                className="flex-shrink-0 text-xs font-semibold text-red-300 hover:text-white px-2 py-1 rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          showQuickPrompts={messages.length <= 2}
        />
      </div>
    </div>
  );
}
