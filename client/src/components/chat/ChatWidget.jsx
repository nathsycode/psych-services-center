import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { MessageCircle, X, Send, Undo2 } from "lucide-react";
import { sendChatMessage } from "../../lib/chatApi";

const STORAGE_KEY = "chat_widget_state";

const entryActions = [
  {
    action: "appointment",
    desc: "Schedule / Manage Appointment",
    userMsg: "Can you help me schedule / manage an appointment?",
    botMsg: "Sure! How would you like me to help?",
    subactions: [
      {
        sub: "schedule",
        subDesc: "Schedule",
        userMsg: "I would like to schedule an appointment",
        botMsg:
          "Absolutely -- Are you looking for an online consultation or an in-person assessment?",
      },
      {
        sub: "cancel",
        subDesc: "Cancel",
        userMsg: "I would like to cancel an upcoming appointment",
        botMsg:
          "Sorry to hear that. To proceed, kindly confirm your full name and email address.",
      },
      {
        sub: "reschedule",
        subDesc: "Reschedule",
        userMsg: "I would like to reschedule an existing appointment",
        botMsg:
          "I'd love to assist -- To proceed, please provide your full name, email address and your preferred date and time for the new schedule.",
      },
    ],
  },
  {
    action: "question",
    desc: "Ask a Question",
    subactions: [
      { sub: "services", subDesc: "Our Services" },
      { sub: "contact", subDesc: "Our Contact Information" },
      { sub: "pricing", subDesc: "Our Pricing / Costs" },
      { sub: "others", subDesc: "Other information" },
    ],
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ChatWidget() {
  const stored = loadState();

  const [mode, setMode] = useState("entry");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(stored?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState("");
  const [lastIntent, setLastIntent] = useState(null);

  const [sessionId] = useState(stored?.sessionId || crypto.randomUUID());

  const [hasGreeted, setHasGreeted] = useState(stored?.hasGreeted || false);

  useEffect(() => {
    saveState({
      sessionId,
      messages,
      hasGreeted,
    });
  }, [sessionId, messages, hasGreeted]);

  const initialGreet = () => {
    if (hasGreeted) return;

    const greeting = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hi there! I'm here if you have questions about our services, scheduling, or next steps. You're welcome to take your time!",
      timestamp: Date.now(),
    };

    setMessages((m) => [...m, greeting]);
    setHasGreeted(true);
  };

  const sendMessage = async (content) => {
    if (isTyping) return;
    setLastIntent(null);
    const userMsg = {
      id: uuid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const data = await sendChatMessage({
        sessionId,
        message: content,
        messages: updatedMessages.map(({ role, content }) => ({
          role,
          content,
        })),
        page: window.location.pathname,
        context: context,
      });

      const botMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((m) => [...m, botMsg]);

      console.log("AI Intent", data.intent);
      setLastIntent(data.intent);
    } catch (err) {
      console.error("Chat Error:", err);
    }

    setIsTyping(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
            initialGreet();
          }
        }}
        aria-label="Open Chat"
        className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-model="true"
          className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col rounded-xl bg-white shadow-2xl"
        >
          <ChatHeader onClose={() => setIsOpen(false)} />
          <ChatMessages messages={messages} isTyping={isTyping} />
          <p>{mode}</p>
          {mode === "entry" && (
            <EntryActions
              onSelect={(choice) => {
                const entryAction = entryActions.filter(
                  (i) => i.action === choice,
                )[0];

                if (entryAction) {
                  setMode(entryAction.action);

                  if (entryAction.userMsg) {
                    const userInput = {
                      id: crypto.randomUUID(),
                      role: "user",
                      content: `${entryAction.userMsg}`,
                      timestamp: Date.now(),
                    };

                    const botInput = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: `${entryAction.botMsg}`,
                      timestamp: Date.now(),
                    };

                    setMessages((m) => [...m, userInput, botInput]);
                  }
                }
              }}
            />
          )}
          {(mode === "appointment" || mode === "question") && (
            <SubActions
              mode={mode}
              onSelect={(choice) => {
                const subAction = entryActions
                  .filter((ent) => ent.action === mode)[0]
                  .subactions.filter((sub) => sub.sub === choice)[0];
                console.log(subAction, choice);
                if (subAction) {
                  if (subAction.userMsg) {
                    const userInput = {
                      id: crypto.randomUUID(),
                      role: "user",
                      content: `${subAction.userMsg}`,
                      timestamp: Date.now(),
                    };

                    setMessages((m) => [...m, userInput]);
                  }

                  if (subAction.botMsg) {
                    const botInput = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: `${subAction.botMsg}`,
                      timestamp: Date.now(),
                    };

                    setMessages((m) => [...m, botInput]);
                  }
                  setMode("chat");
                }
              }}
            />
          )}
          {/* <IntentActions intent={lastIntent} /> */}
          {mode !== "chat" && mode !== "entry" && (
            <ResetActions
              onSelect={(choice) => {
                setMode(choice);
              }}
            />
          )}
          {mode === "chat" && (
            <ChatInput onSend={sendMessage} disabled={isTyping} />
          )}
        </div>
      )}
    </>
  );
}

function ChatHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">Support Assistant</p>
        <p className="text-xs text-gray-500">Secure • Private • Optional</p>
      </div>
      <button
        onClick={onClose}
        aria-label="close chat"
        className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ChatMessages({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      <div className="space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isTyping && (
          <div className="text-xs text-gray-400">Assistant is typing...</div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <>
      <div
        className={`max-w-[85%] ${isUser ? "ml-auto text-right" : "text-left"}`}
      >
        <div className="mb-1 text-xs text-gray-500">
          {isUser ? "You" : "Support Assistant"} •{" "}
          {formatTime(message.timestamp)}
        </div>

        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            isUser ? "bg-primary text-white" : "bg-gray-100 text-slate-900"
          }`}
        >
          {message.content}
        </div>
      </div>
    </>
  );
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!value.trim()) return;

    onSend(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={submit} className="border-t p-3">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-sky-400"
        />
        <button type="submit" disabled={disabled}>
          <Send className="h-5 w-5 text-primary disabled:opacity-50" />
        </button>
      </div>
    </form>
  );
}

function EntryActions({ onSelect }) {
  return (
    <div className="space-y-2 p-4">
      <p className="text-sm text-slate-500 text-center">
        How can we help today?
      </p>

      {entryActions.map((act) => {
        return (
          <button onClick={() => onSelect(act.action)} className="w-full btn">
            {act.desc}
          </button>
        );
      })}
    </div>
  );
}

function SubActions({ mode, onSelect }) {
  const action = entryActions.filter((act) => act.action === mode)[0];

  console.log(action);

  return (
    <div className="space-y-2 p-4">
      <p className="text-sm text-gray-500 text-center">{action.desc}</p>

      {action.subactions.map((sub) => {
        return (
          <button onClick={() => onSelect(sub.sub)} className="w-full btn">
            {sub.subDesc}
          </button>
        );
      })}
    </div>
  );
}

function ResetActions({ onSelect }) {
  return (
    <div className="absolute bottom-4 right-4 text-slate-400 hover:bg-slate-100 rounded-md p-1">
      <button onClick={() => onSelect("entry")}>
        <Undo2 className="w-4 h-4" />
      </button>
    </div>
  );
}
