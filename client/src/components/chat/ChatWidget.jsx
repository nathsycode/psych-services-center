import { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { MessageCircle, X, Send } from 'lucide-react';

const STORAGE_KEY = "chat_widget_state";

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

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(stored?.messages || []);
  const [isTyping, setIsTyping] = useState(false);

  console.log(import.meta.env.VITE_CHAT_API_URL); // TODO: Delete this

  const [sessionId] = useState(
    stored?.sessionId || crypto.randomUUID()
  );

  const [hasGreeted, setHasGreeted] = useState(
    stored?.hasGreeted || false
  )

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
    const userMsg = {
      id: uuid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((m) => [...m, userMsg]);
    setIsTyping(true);


    await new Promise((r) => setTimeout(r, 900));

    const botMsg = {
      id: uuid(),
      role: 'assistant',
      content: 'Thanks for reaching out!',
      timestamp: Date.now(),
    }

    setMessages((m) => [...m, botMsg]);
    setIsTyping(false);
  }

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
            setIsOpen(false)
          } else {
            setIsOpen(true)
            initialGreet();
          }
        }}
        aria-label="Open Chat"
        className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-sky-400">
        <MessageCircle className="h-6 w-6" />
      </button >

      {isOpen && (
        <div
          role="dialog"
          aria-model="true"
          className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col rounded-xl bg-white shadow-2xl"
        >
          <ChatHeader onClose={() => setIsOpen(false)} />
          <ChatMessages messages={messages} isTyping={isTyping} />
          <ChatInput onSend={sendMessage} />
        </div>
      )
      }
    </>
  )
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
  )
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
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (<>
    <div
      className={`max-w-[85%] ${isUser ? 'ml-auto text-right' : 'text-left'}`}
    >
      <div className="mb-1 text-xs text-gray-500">
        {isUser ? "You" : "Support Assistant"} •{" "}
        {formatTime(message.timestamp)}
      </div>

      <div
        className={`rounded-lg px-3 py-2 text-sm ${isUser
          ? "bg-primary text-white"
          : 'bg-gray-100 text-slate-900'
          }`}>
        {message.content}
      </div>
    </div>

  </>)
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: '2-digit',
  });
}

function ChatInput({ onSend }) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <div className="border-t p-3">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type your message..."
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button>
          <Send strokeWidth='2' className='w-5 h-5 text-primary' />
        </button>
      </div>
    </div>
  )

}
