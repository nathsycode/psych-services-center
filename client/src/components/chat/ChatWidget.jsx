import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { MessageCircle, X, Send, Undo2, CircleAlert } from "lucide-react";
import { sendChatMessage } from "../../lib/chatApi";
import { Tooltip } from "radix-ui";

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
          "Absolutely -- We offer online consultations and in-person assessment. Please let me know what interests you, as well as your preferred date and time.",
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
    userMsg: "I want to learn more about something",
    botMsg:
      "Sure! I'd be happy to assist. What would you like to learn more about?",
    subactions: [
      {
        sub: "services",
        subDesc: "Our Services",
        userMsg: "Tell me more about your services",
        botMsg:
          "We offer a wide range of services, primarily online and private calls with our professional and licensed therapists, as well as in-person assessment with standardized testing. If you have further questions, I'd be happy to clarify.",
      },
      {
        sub: "contact",
        subDesc: "Our Contact Information",
        userMsg: "How can I contact you directly?",
        botMsg:
          "Sure, you may reach us via email at support@mindcare.com or phone at (+63)9 12 123 1234",
      },
      {
        sub: "pricing",
        subDesc: "Our Pricing / Costs",
        userMsg:
          "I would like to know more about the details on the costs involved",
        botMsg:
          "Absolutely, we offer free initial consultation and assessment, after that, our pricing gets tiered based on the test battery involved. To learn more about how each test battery and lab pricing, kindly see this link: mindcare.ph/tests",
      },
      {
        sub: "others",
        subDesc: "Other information",
        userMsg: "I would like to discuss something else",
        botMsg: "I understand, what do you have in mind?",
      },
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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inputChat(role, content) {
  return {
    id: crypto.randomUUID(),
    role: role,
    content: content,
    timestamp: Date.now(),
  };
}

function applyEntryAction(choice, { setMessages, setMode }) {
  const entry = entryActions.find((a) => a.action === choice);

  if (!entry) return;

  setMode(entry.action);

  setMessages((m) =>
    [
      ...m,
      entry.userMsg && inputChat("user", entry.userMsg),
      entry.botMsg && inputChat("assistant", entry.botMsg),
    ].filter(Boolean),
  );
}

function applySubAction(mode, choice, { setMessages, setMode }) {
  const entry = entryActions.find((a) => a.action === mode);

  if (!entry) return;

  const subAction = entry.subactions.find((sub) => sub.sub === choice);

  if (!subAction) return;

  console.log(subAction, choice);


  setMessages((m) =>
    [
      ...m,
      subAction.userMsg && inputChat("user", subAction.userMsg),
      subAction.botMsg && inputChat("assistant", subAction.botMsg),
    ].filter(Boolean),
  );

  if (choice !== 'schedule') {
    setMode("chat");
  } else {
    setMode(choice);
  }
}

export default function ChatWidget() {
  const stored = loadState();

  const [mode, setMode] = useState("entry");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(stored?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState(null);
  const [flowData, setFlowData] = useState({});

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

    setMessages((m) => [
      ...m,
      inputChat(
        "assistant",
        "Hi there! I'm here if you have questions about our services, scheduling, or next steps. You're welcome to take your time!",
      ),
    ]);
    setHasGreeted(true);
  };

  const sendMessage = async (content) => {
    if (isTyping) return;

    setLastIntent(null);
    setIsTyping(true);

    const userMsg = inputChat("user", content);

    let nextMessages;

    setMessages((m) => {
      nextMessages = [...m, userMsg];
      return nextMessages
    });


    try {
      const data = await sendChatMessage({
        sessionId,
        message: content,
        messages: nextMessages.map(({ role, content }) => ({
          role,
          content,
        })),
        page: window.location.pathname,
      });

      setMessages((m) => [...m, inputChat("assistant", data.reply)]);

      console.log("AI Intent", data.intent);
      setLastIntent(data.intent);
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsTyping(false);
    }

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
      <ChatTooltip content="Chat with AI Support Assistant">
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
          className="fixed bottom-6 right-6 rounded-full bg-primary p-4 text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-sky-400 border-2 border-solid border-white"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </ChatTooltip>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[360px] flex-col rounded-xl bg-white shadow-2xl"
        >
          <ChatHeader onClose={() => setIsOpen(false)} />
          <ChatMessages messages={messages} isTyping={isTyping} />
          {mode === "entry" && (
            <EntryActions
              onSelect={(choice) => {
                applyEntryAction(choice, { setMessages, setMode });
              }}
            />
          )}
          {(mode === "appointment" || mode === "question") && (
            <SubActions
              mode={mode}
              onSelect={(choice) => {
                applySubAction(mode, choice, { setMessages, setMode });
              }}
            />
          )}
          {mode === 'schedule' && !flowData.service && (
            <ServicePicker onSelect={(service) => setFlowData((f) => ({ ...f, service }))}
            />
          )}

          {mode === 'schedule' && flowData.service && !flowData.selectedSlot && (
            <AvailabilityPicker
              flowData={flowData}
              onSelectSlot={(slot) => setFlowData((f) => ({ ...f, selectedSlot: slot }))}
            />
          )}

          {flowData.selectedSlot && !flowData.bookingId && (
            <ConfirmBooking
              slot={flowData.selectedSlot}
              onConfirm={"confirmed"}
            />
          )}

          {mode !== "entry" && (
            <ResetActions
              mode={mode}
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
        <p className="text-sm font-medium text-gray-900 flex">
          Support Assistant{" "}
          <ChatTooltip content="Some of my answers are AI-generated and may be incorrect">
            <CircleAlert className="w-4 h-4 mx-1.5 text-slate-400 hover:scale-110 hover:text-slate-600 transition-all duration-300 ease-out" />
          </ChatTooltip>
        </p>
        <p className="text-xs text-gray-500">Secure • Private • Optional</p>
      </div>
      <ChatTooltip content="Close Chat">
        <button
          onClick={onClose}
          aria-label="close chat"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </ChatTooltip>
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
          className={`rounded-lg px-3 py-2 text-sm ${isUser ? "bg-primary text-white" : "bg-gray-100 text-slate-900"
            }`}
        >
          {message.content}
        </div>
      </div>
    </>
  );
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
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <ChatTooltip content="Send Message">
          <button type="submit" disabled={disabled}>
            <Send className="h-5 w-5 text-primary hover:text-accent disabled:opacity-50 hover:scale-105 duration-200" />
          </button>
        </ChatTooltip>
      </div>
    </form>
  );
}

function EntryActions({ onSelect }) {
  return (
    <div className="space-y-2 p-4 flex flex-col">
      {entryActions.map((act) => {
        return (
          <button
            key={act.action}
            onClick={() => onSelect(act.action)}
            className="ml-auto text-right btn border-primary/75 border hover:bg-primary hover:text-white px-3 py-2 rounded-full text-sm transition-all duration-300"
          >
            {act.desc}
          </button>
        );
      })}
    </div>
  );
}

function SubActions({ mode, onSelect }) {
  const action = entryActions.filter((act) => act.action === mode)[0];

  return (
    <div className="space-y-2 px-4 flex flex-col">
      {action.subactions.map((sub) => {
        return (
          <button
            key={sub.sub}
            onClick={() => onSelect(sub.sub)}
            className="ml-auto text-right btn border-accent/75 border hover:bg-accent hover:text-white px-3 py-2 rounded-full text-sm transition-all duration-300"
          >
            {sub.subDesc}
          </button>
        );
      })}
    </div>
  );
} function ResetActions({ mode, onSelect }) {
  return (
    <>
      <div className="space-y-2 p-4 flex flex-col">
        <ChatTooltip content="Start Over">
          <button
            className={`btn p-2 rounded-full hover:bg-slate-100
            ${mode === "chat" ? "justify-center m-auto" : "ml-auto text-right"}`}
            onClick={() => onSelect("entry")}
          >
            <Undo2 className="w-4 h-4 text-slate-600 text-center" />
          </button>
        </ChatTooltip>
      </div>
    </>
  );
}

function ChatTooltip({ content, children }) {
  return (
    <Tooltip.Provider delayDuration={400}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="z-[9999] rounded-md bg-slate-500 px-2 py-1 text-xs text-white shadow-lg"
          >
            {content}
            <Tooltip.Arrow className="fill-slate-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

function ServicePicker({ onSelect }) {
  return (
    <div className="space-y-2 p-4">
      <button
        onClick={() => onSelect("consultation")}
        className='btn w-full'
      >
        Online Consultation
      </button>
      <button
        onClick={() => onSelect("assessment")}
        className='btn w-full'
      >
        In-Person Assessment
      </button>
    </div>
  )
}

const VITE_CALENDAR_AVAILABILITY_URL = "http://localhost:5678/webhook-test/calendar/availability"

const getAvailability = async (service) => {
  const res = await fetch(VITE_CALENDAR_AVAILABILITY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: service,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  })

  const data = await res.json();

  return data.slots
}

function AvailabilityPicker({ flowData, onSelectSlot }) {
  console.log(flowData, onSelectSlot);

  console.log(getAvailability(flowData.service))

  return (
    <div>
      Availability Picker
    </div>
  )
}

function ConfirmBooking({ slot, onConfirm }) {
  console.log(slot, onConfirm);

  return (
    <div>
      Confirm Booking
    </div>
  )
}
