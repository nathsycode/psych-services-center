import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const [sessionId] = useState(() => crypto.randomUUID());

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

  return (
    <>
      <button
        onClick={() => isOpen ? setIsOpen(false) : setIsOpen(true)}
        aria-label="Open Chat"
        className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-sky-400">
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
          <ChatInput onSend={sendMessage} />
        </div>
      )}
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
  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === 'user'
            ? "ml-auto bg-primary text-white"
            : 'bg-gray-100 text-gray-900'
            }`}
        >
          {m.content}
        </div>
      ))}

      {isTyping && (
        <div className="text-xs text-gray-400">Assistant is typing...</div>
      )}
    </div>
  )
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
          <Send strokeWidth='2' className='w-5 h-5' />
        </button>
      </div>
    </div>
  )

}
