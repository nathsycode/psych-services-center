/* TODO:
 * Add "ask questions" & "help schedule" floating icons on chat mode
 * Refactor sub actions?
 *
 */

import { useState, useEffect, useRef, useReducer, useMemo } from "react";
import { v4 as uuid } from "uuid";
import {
  MessageCircle,
  X,
  Send,
  Undo2,
  CircleAlert,
  CalendarSearch,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { sendChatMessage } from "../../lib/chatApi";
import { Tooltip, Form } from "radix-ui";

const STORAGE_KEY = "chat_widget_state";
const VITE_CALENDAR_AVAILABILITY_URL = import.meta.env
  .VITE_CALENDAR_AVAILABILITY_URL;
// const VITE_BOOKING_URL = import.meta.env.VITE_BOOKING_URL;
const VITE_BOOKING_URL = import.meta.env.VITE_TEST_BOOKING_URL;

// HACK: TESTING ONLY
// const VITE_CALENDAR_AVAILABILITY_URL =
//   "http://localhost:5678/webhook-test/calendar/availability";
const DEV = import.meta.env.DEV;

const MODES = Object.freeze({
  ENTRY: "entry",
  APPOINTMENT: "appointment",
  SCHEDULE: "schedule",
  QUESTION: "question",
  CHAT: "chat",
});

const SUBMODES = Object.freeze({
  APPOINTMENT: Object.freeze({
    SCHEDULE: "schedule",
    CANCEL: "cancel",
    RESCHEDULE: "reschedule",
  }),
  QUESTION: Object.freeze({
    SERVICES: "services",
    CONTACT: "contact",
    PRICING: "pricing",
    OTHERS: "others",
  }),
});

const entryActions = [
  {
    action: MODES.APPOINTMENT,
    desc: "Schedule / Manage Appointment",
    userMsg: "Can you help me schedule / manage an appointment?",
    botMsg: "Sure! How would you like me to help?",
    subactions: [
      {
        sub: SUBMODES.APPOINTMENT.SCHEDULE,
        subDesc: "Schedule",
        userMsg: "I would like to schedule an appointment",
        botMsg:
          "Absolutely -- We offer online consultations and in-person assessment. Please let me know what interests you, as well as your preferred date and time.",
      },
      {
        sub: SUBMODES.APPOINTMENT.CANCEL,
        subDesc: "Cancel",
        userMsg: "I would like to cancel an upcoming appointment",
        botMsg:
          "Sorry to hear that. To proceed, kindly confirm your full name and email address.",
      },
      {
        sub: SUBMODES.APPOINTMENT.RESCHEDULE,
        subDesc: "Reschedule",
        userMsg: "I would like to reschedule an existing appointment",
        botMsg:
          "I'd love to assist -- To proceed, please provide your full name, email address and your preferred date and time for the new schedule.",
      },
    ],
  },
  {
    action: MODES.QUESTION,
    desc: "Ask a Question",
    userMsg: "I want to learn more about something",
    botMsg:
      "Sure! I'd be happy to assist. What would you like to learn more about?",
    subactions: [
      {
        sub: SUBMODES.QUESTION.SERVICES,
        subDesc: "Our Services",
        userMsg: "Tell me more about your services",
        botMsg:
          "We offer a wide range of services, primarily online and private calls with our professional and licensed therapists, as well as in-person assessment with standardized testing. If you have further questions, I'd be happy to clarify.",
      },
      {
        sub: SUBMODES.QUESTION.CONTACT,
        subDesc: "Our Contact Information",
        userMsg: "How can I contact you directly?",
        botMsg:
          "Sure, you may reach us via email at support@mindcare.com or phone at (+63)9 12 123 1234",
      },
      {
        sub: SUBMODES.QUESTION.PRICING,
        subDesc: "Our Pricing / Costs",
        userMsg:
          "I would like to know more about the details on the costs involved",
        botMsg:
          "Absolutely, we offer free initial consultation and assessment, after that, our pricing gets tiered based on the test battery involved. To learn more about how each test battery and lab pricing, kindly see this link: mindcare.ph/tests",
      },
      {
        sub: SUBMODES.QUESTION.OTHERS,
        subDesc: "Other information",
        userMsg: "I would like to discuss something else",
        botMsg: "I understand, what do you have in mind?",
      },
    ],
  },
];

// Helpers

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

async function bookAppointment(payload) {
  const res = await fetch(VITE_BOOKING_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Booking failed");

  return res.json();
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

  console.log(choice, MODES.SCHEDULE, SUBMODES.APPOINTMENT.SCHEDULE);
  if (choice !== SUBMODES.APPOINTMENT.SCHEDULE) {
    setMode(MODES.CHAT);
  } else {
    setMode(choice);
  }
}

function groupByYearMonth(days) {
  const grouped = {};

  days.forEach((day) => {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const month = date.toLocaleDateString("en-US", { month: "long" });

    grouped[year] ??= {};
    grouped[year][month] ??= [];
    grouped[year][month].push(day);
  });

  return grouped;
}

function groupByAbbreviation(slots) {
  const grouped = {};

  slots.forEach((slot) => {
    const abb = slot.slice(6, 8);

    grouped[abb] ??= [];
    grouped[abb].push(slot);
  });

  return grouped;
}

const BOOKING_STEPS = Object.freeze({
  IDLE: "idle",
  SERVICE: "service",
  DATE: "date",
  TIME: "time",
  DETAILS: "details",
  SUBMITTING: "submitting",
  DONE: "done",
  ERROR: "error",
});

const bookingInitialState = {
  step: BOOKING_STEPS.IDLE, // idle | service | date | time | details | submitting | done
  service: null,
  date: null,
  time: null,
  contact: null,
};

const ACTION_TYPES = Object.freeze({
  IDLE: "idle",
  SELECT_SERVICE: "service",
  SELECT_DATE: "date",
  SELECT_TIME: "time",
  BACK_TO_DATE: "back_date",
  BACK_TO_TIME: "back_time",
  RESET: "reset",
  SUBMIT_DETAILS: "submit",
  DEV_FORCE_SUBMIT: "dev_force_submit",
});

function bookingReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return bookingInitialState;

    case ACTION_TYPES.IDLE:
      return {
        ...bookingInitialState,
        step: BOOKING_STEPS.IDLE,
      };

    case ACTION_TYPES.SELECT_SERVICE:
      return {
        ...bookingInitialState,
        step: BOOKING_STEPS.DATE,
        service: action.service,
      };

    case ACTION_TYPES.SELECT_DATE:
      return {
        ...state,
        step: BOOKING_STEPS.TIME,
        date: action.date,
      };

    case ACTION_TYPES.SELECT_TIME:
      return {
        ...state,
        step: BOOKING_STEPS.DETAILS,
        time: action.time,
      };

    case ACTION_TYPES.BACK_TO_DATE:
      return {
        ...state,
        step: BOOKING_STEPS.DATE,
        time: null,
      };

    case ACTION_TYPES.BACK_TO_TIME:
      return {
        ...state,
        step: BOOKING_STEPS.TIME,
      };

    case ACTION_TYPES.SUBMIT_DETAILS:
      return {
        ...state,
        step: BOOKING_STEPS.SUBMITTING,
        contact: action.contact,
      };

    case ACTION_TYPES.DEV_FORCE_SUBMIT:
      return {
        step: BOOKING_STEPS.SUBMITTING,
        service: action.service,
        date: action.date,
        time: action.time,
        contact: action.contact,
      }

    default:
      return state;
  }
}

const ENTRY_PHASES = Object.freeze({
  ROOT: "root",
  APPOINTMENT: "appointment",
  NONE: "none",
});

export default function ChatWidget() {
  const stored = loadState();

  const [mode, setMode] = useState(MODES.ENTRY);
  const [entryPhase, setEntryPhase] = useState(ENTRY_PHASES.ROOT);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(stored?.messages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [showDebug, setShowDebug] = useState(false); //TODO: REMOVE ON PROD

  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  const [sessionId] = useState(stored?.sessionId || crypto.randomUUID());

  const [hasGreeted, setHasGreeted] = useState(stored?.hasGreeted || false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [booking, dispatchBooking] = useReducer(
    bookingReducer,
    bookingInitialState,
  );

  useEffect(() => {
    // Local Storage
    saveState({
      sessionId,
      messages,
      hasGreeted,
      mode,
    });
  }, [sessionId, messages, hasGreeted]);

  useEffect(() => {
    // Debugging
    console.log("BOOKING STATE", booking);
  }, [booking]);

  // NOTE: Fetch Availability
  useEffect(() => {
    console.log("use effect", booking.service);
    if (!booking.service) return;
    console.log("booking service", booking.service);

    setLoadingAvailability(true);
    setAvailabilityError(null);

    getAvailability(booking.service)
      .then((data) => {
        console.log("Availability response: ", data);
        setAvailability(data);
      })
      .catch((err) => {
        console.error(err);
        setAvailabilityError("Unable to load availability");
      })
      .finally(() => setLoadingAvailability(false));
  }, [booking.service]);

  useEffect(() => {
    if (booking.step !== BOOKING_STEPS.SUBMITTING) return;

    async function submit() {
      try {
        await confirmBooking();

        dispatchBooking({ type: ACTION_TYPES.RESET });
        setMode(MODES.CHAT);

        setMessages((m) => [
          ...m,
          inputChat("assistant", "✅ Your appointment has been booked."),
        ]);
      } catch {
        dispatchBooking({ type: ACTION_TYPES.RESET });

        setMessages((m) => [
          ...m,
          inputChat("assistant", "❌ Something went wrong. Please try again."),
        ]);
      }
    }

    submit();
  }, [booking.step]);

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

    setIsTyping(true);

    const userMsg = inputChat("user", content);

    let nextMessages;

    setMessages((m) => {
      nextMessages = [...m, userMsg];
      return nextMessages;
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
    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // HACK: [] on keypress, for debug reload storage
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    // HACK: [] on keypress, for debug
    const handler = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x") {
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    console.log(DEV);
    if (!DEV) return;

    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "B") {
        dispatchBooking({
          type: ACTION_TYPES.DEV_FORCE_SUBMIT,
          service: "consultation",
          date: "2026-01-20",
          time: "12:00 PM",
          contact: {
            fullName: "Dev Test",
            email: "dev@test.com",
          },
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // const USE_MOCK_BOOKING = true; //TODO: REMOVE

  const confirmBooking = async () => {
    setBookingLoading(true);

    // if (USE_MOCK_BOOKING) {
    //   await new Promise((r) => setTimeout(r, 800));
    //
    //   setMessages((m) => [
    //     ...m,
    //     inputChat("assistant", "(MOCK) Your appointment has been booked."),
    //   ]);
    //
    //   setBookingLoading(false);
    //   return;
    // }

    console.log("confirmBooking", VITE_BOOKING_URL);

    try {
      return await bookAppointment({
        service: booking.service,
        date: booking.date,
        time: booking.time,
        contact: booking.contact.fullName,
        email: booking.contact.email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } finally {
      setBookingLoading(false);
    }
  };

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

          {showDebug && (
            <div className="absolute text-center items-center justify-center w-full bg-primary flex flex-col">
              <p>{mode ? mode : ""}</p>
              {/* {booking.service && <p>{booking.service}</p>} */}
            </div>
          )}
          {/* NOTE: ChatMessages should show when booking step is not idle */}

          {mode !== MODES.APPOINTMENT ||
            booking.step === BOOKING_STEPS.IDLE ||
            booking.step === BOOKING_STEPS.SERVICE ? (
            <ChatMessages messages={messages} isTyping={isTyping} />
          ) : null}

          {mode === MODES.APPOINTMENT && (
            <AvailabilityPicker
              booking={booking}
              availability={availability}
              dispatchBooking={dispatchBooking}
              loadingAvailability={loadingAvailability}
              availabilityError={availabilityError}
            />
          )}

          {entryPhase === ENTRY_PHASES.ROOT && (
            <EntryActions
              onSelect={(choice) => {
                if (choice === "question") {
                  setEntryPhase(ENTRY_PHASES.NONE);
                  setMode(MODES.QUESTION);
                }
                if (choice === "appointment") {
                  setEntryPhase(ENTRY_PHASES.APPOINTMENT);
                }
              }}
            />
          )}

          {entryPhase === ENTRY_PHASES.APPOINTMENT && (
            <SubActions
              subactions={
                entryActions.find((act) => act.action === MODES.APPOINTMENT)
                  .subactions
              }
              onSelect={(choice) => {
                console.log("selecting appointment action", choice);
                if (choice === SUBMODES.APPOINTMENT.SCHEDULE) {
                  console.log("proceed with booking process");
                  dispatchBooking({ type: ACTION_TYPES.IDLE });
                  setEntryPhase(ENTRY_PHASES.NONE);
                  setMode(MODES.APPOINTMENT);
                }
              }}
            />
          )}

          {entryPhase === ENTRY_PHASES.NONE && mode === MODES.QUESTION && (
            <SubActions
              subactions={
                entryActions.find((act) => act.action === MODES.QUESTION)
                  .subactions
              }
              onSelect={(choice) => {
                console.log("from widget", choice);
                applySubAction(MODES.QUESTION, choice, {
                  setMessages,
                  setMode,
                });
              }}
            />
          )}

          {availabilityError && (
            <div className="px-4 py-2 text-sm text-red-500">
              {availabilityError}
            </div>
          )}

          {entryPhase !== ENTRY_PHASES.ROOT && !booking.service && (
            <ResetActions
              mode={mode}
              onSelect={(choice) => {
                setMode(MODES.ENTRY);
                setEntryPhase(ENTRY_PHASES.ROOT);
              }}
            />
          )}

          {mode === MODES.CHAT && (
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

function SubActions({ subactions, onSelect }) {
  console.log(subactions);
  return (
    <div className="space-y-2 mt-4 px-4 flex flex-col">
      {subactions.map((sub) => {
        console.log(sub.sub);
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
}

function ResetActions({ mode, onSelect }) {
  return (
    <>
      <div className="space-y-2 p-4 flex flex-col">
        <ChatTooltip content="Start Over">
          <button
            className={`btn p-2 rounded-full hover:bg-slate-100
            ${mode === MODES.CHAT ? "justify-center m-auto" : "ml-auto text-right"}`}
            onClick={() => onSelect(MODES.ENTRY)}
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

function DetailsForm({ service, date, time, onSubmit, onBack }) {
  const serviceLabel = useMemo(() => {
    switch (service) {
      case "consultation":
        return "Online Mental Health Consultation";
      case "assessment":
        return "In-Person Psychological Assessment";
    }
  }, [service]);

  const dateLabel = useMemo(() => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [date]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const canSubmit = fullName.trim() && email.trim();

  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <div className="w-full flex flex-col px-4 py-4 border-b border-slate-200 mb-4">
        <p className="font-semibold text-lg text-slate-900">{serviceLabel}</p>
        <div className="flex flex-row items-center justify-start gap-2 text-slate-600 text-sm mt-1.5">
          <Calendar className="h-4 w-4" />
          {dateLabel}
        </div>
        <div className="flex flex-row items-center justify-start gap-2 text-slate-600 text-sm mt-1.5">
          <Clock className="h-4 w-4" />
          {time}
        </div>
      </div>
      <div className="px-4 py-2 min-h-0 overflow-y-auto">
        <Form.Root
          className="w-[260px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({ fullName, email });
          }}
        >
          <Form.Field className="mb-2.5 grid" name="name">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-slate-900">
                Full Name*
              </Form.Label>
              <Form.Message
                id="name-error"
                className="text-[13px] text-red-500 opacity-80"
                match="valueMissing"
              >
                Please enter your full name
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-md px-2.5 text-[15px] leading-none text-black border border-slate-400 focus:outline-none focus:border-primary focus:border-2 transition-colors duration-300"
                required
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name..."
                value={fullName}
                aria-describedby="name-error"
                onChange={(e) => {
                  setFullName(e.target.value);
                }}
              />
            </Form.Control>
          </Form.Field>
          <Form.Field className="mb-2.5 grid" name="email">
            <div className="flex items-baseline justify-between">
              <Form.Label className="text-[15px] font-medium leading-[35px] text-black">
                Email*
              </Form.Label>
              <Form.Message
                id="email-required"
                className="text-[13px] text-red-600 opacity-80"
                match="valueMissing"
              >
                Please enter your email
              </Form.Message>
              <Form.Message
                id="email-invalid"
                className="text-[13px] text-red-600 opacity-80"
                match="typeMismatch"
              >
                Please provide a valid email
              </Form.Message>
            </div>
            <Form.Control asChild>
              <input
                className="box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-md px-2.5 text-[15px] leading-none text-black border border-slate-400 focus:outline-none focus:border-primary focus:border-2 transition-colors duration-300"
                type="email"
                required
                placeholder="Your email..."
                aria-describedby="email-required email-invalid"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </Form.Control>
          </Form.Field>
          <div className="flex flex-row items-center justify-between gap-3 mt-6">
            <ChatTooltip content="Select Another Time">
              <button
                type="button"
                className="border border-slate-500 px-3 py-2 rounded-full group flex flex-row gap-2 duration-300 transition-all ease-in-out hover:bg-primary/5 hover:border-primary"
                onClick={() => onBack()}
                aria-label="Select Another Time"
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:text-primary" />
              </button>
            </ChatTooltip>
            <Form.Submit asChild>
              <button
                disabled={!canSubmit}
                className="flex-1 rounded-full px-3 py-2 bg-primary text-white transition-colors duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </Form.Submit>
          </div>
        </Form.Root>
      </div>
    </div>
  );
}

function ServicePicker({ onSelect }) {
  return (
    <div className="space-y-2 p-4 flex flex-col flex-end justify-end">
      <button
        onClick={() => onSelect("consultation")}
        className="ml-auto text-right btn border-accent/75 border hover:bg-accent hover:text-white px-3 py-2 rounded-full text-sm transition-all duration-300"
      >
        Online Consultation
      </button>
      <button
        onClick={() => onSelect("assessment")}
        className="ml-auto text-right btn border-accent/75 border hover:bg-accent hover:text-white px-3 py-2 rounded-full text-sm transition-all duration-300"
      >
        In-Person Assessment
      </button>
    </div>
  );
}

const getAvailability = async (service) => {
  console.log("get avail", service);
  const res = await fetch(VITE_CALENDAR_AVAILABILITY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service: service,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch availability");
  }

  const data = await res.json();

  return data.availability;
};

function AvailabilityPicker({
  booking,
  availability,
  dispatchBooking,
  loadingAvailability,
  availabilityError,
}) {
  // if (!availability) return null;

  if (booking.step !== BOOKING_STEPS.IDLE) {
    if (loadingAvailability) {
      return (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
          Loading availability...
        </div>
      );
    }

    if (availabilityError) {
      return (
        <div className="p-4 text-sm text-red-500">{availabilityError}</div>
      );
    }

    if (!availability || availability.length === 0) {
      return (
        <div className="p-4 text-sm text-slate-500">
          No available times found. Please try again later.
        </div>
      );
    }
  }

  switch (booking.step) {
    case BOOKING_STEPS.IDLE:
      return (
        <ServicePicker
          onSelect={(service) => {
            dispatchBooking({ type: ACTION_TYPES.SELECT_SERVICE, service });
          }}
        />
      );
    case BOOKING_STEPS.DATE:
      return (
        <DatePicker
          availability={availability}
          onSelectDate={(date) => {
            dispatchBooking({ type: ACTION_TYPES.SELECT_DATE, date });
          }}
          onSelectBack={() => dispatchBooking({ type: ACTION_TYPES.RESET })}
        />
      );

    case BOOKING_STEPS.TIME:
      return (
        <TimePicker
          availability={availability}
          selectedDate={booking.date}
          onSelectTime={(time) =>
            dispatchBooking({ type: ACTION_TYPES.SELECT_TIME, time })
          }
          onSelectBack={() =>
            dispatchBooking({ type: ACTION_TYPES.BACK_TO_DATE })
          }
        />
      );

    case BOOKING_STEPS.DETAILS:
      return (
        <DetailsForm
          service={booking.service}
          date={booking.date}
          time={booking.time}
          onSubmit={(contact) =>
            dispatchBooking({ type: ACTION_TYPES.SUBMIT_DETAILS, contact })
          }
          onBack={() => dispatchBooking({ type: ACTION_TYPES.BACK_TO_TIME })}
        />
      );

    case BOOKING_STEPS.SUBMITTING:
      return (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
          Booking your appointment...
        </div>
      );

    default:
      return null;
  }

  // const [selectedDate, setSelectedDate] = useState(null);
  // const [selectedTime, setSelectedTime] = useState(null);
  // const [contactInfo, setContactInfo] = useState({});
  // const [sendRequest, setSendRequest] = useState(false);
  //
  // if (!availability || availability.length === 0) {
  //   return (
  //     <div className="p-4 text-sm text-slate-500">No available times found</div>
  //   );
  // }
  //
  // const earliestDay = availability.find((d) => d.slots.length > 0);
  //
  // if (selectedDate && selectedTime && sendRequest) {
  //   return (
  //     <>
  //       <div>
  //         Confirming request to book: {service}
  //         Date and Time: {selectedDate} at {selectedTime}
  //         {/* Name: {contactInfo.fullName} */}
  //         {/* Email: {contactInfo.email} */}
  //       </div>
  //       <button onClick={() => setSelectedDate(null)}>Reset Date</button>
  //       <button onClick={() => setSelectedTime(null)}>Reset Time</button>
  //       <button onClick={() => setSendRequest(false)}>Reset Request</button>
  //       <button onClick={onSelectBack}>Reset All</button>
  //     </>
  //   );
  // }
  //
  // if (selectedDate && selectedTime) {
  //   return (
  //     <>
  //       {/* <p>Details Form</p> */}
  //       {/* <div>{selectedTime}</div> */}
  //       <DetailsForm
  //         selectedService={service}
  //         selectedDate={selectedDate}
  //         selectedTime={selectedTime}
  //         setContactInfo={setContactInfo}
  //         onSelectBack={() => setSelectedTime(null)}
  //         onConfirm={() => {
  //           setSendRequest(true);
  //         }}
  //       />
  //     </>
  //   );
  // }
  //
  // if (selectedDate) {
  //   const day = availability.find((d) => d.date === selectedDate);
  //   const grouped = groupByAbbreviation(day.slots);
  //
  //   return (
  //     <div className="h-full min-h-0 flex flex-col p-4">
  //       <div className="text-xs font-semibold">{day.date}</div>
  //       <div className="text-xs">{day.weekday}</div>
  //
  //       <div className="flex-1 min-h-0 overflow-y-auto py-2">
  //         {Object.entries(grouped).map(([abb, slots]) => {
  //           return (
  //             <div className="flex flex-col">
  //               <p className="font-semibold text-sm">{abb}</p>
  //               <div className="grid grid-cols-4 gap-2 p-2 content-start">
  //                 {slots.map((slot) => (
  //                   <button
  //                     key={slot.slice(0, 5)}
  //                     className="text-sm font-normal rounded-md h-14 border hover:bg-primary/5 hover:border-primary p-1 flex flex-col items-center justify-center transition-all duration-300"
  //                     onClick={() => {
  //                       setSelectedTime(slot);
  //                       onSelectSlot();
  //                     }}
  //                   >
  //                     {slot.slice(0, 5)}
  //                   </button>
  //                 ))}
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //
  //       <div className="shrink-0 flex flex-row justify-center gap-4">
  //         <ChatTooltip content="Go Back to Services">
  //           <button
  //             className="p-2 rounded-full hover:bg-primary/5 transition-all duration-300"
  //             onClick={onSelectBack}
  //           >
  //             <Undo2 className="h-5 w-5 text-slate-600" />
  //           </button>
  //         </ChatTooltip>
  //         <ChatTooltip content="Search for Another Date">
  //           <button
  //             className="p-2 rounded-full hover:bg-primary/5 transition-all duration-300"
  //             onClick={() => setSelectedDate(null)}
  //           >
  //             <CalendarSearch className="h-5 w-5 text-slate-600" />
  //           </button>
  //         </ChatTooltip>
  //       </div>
  //     </div>
  //   );
  // }
  //
  // return (
  //   <DatePicker
  //     availability={availability}
  //     onSelectDate={onSelectDate}
  //     onSelectSlot={onSelectSlot}
  //     onSelectEarliest={() => onSelectDate(earliestDay.date)}
  //     onSelectBack={onSelectBack}
  //   />
  // );
}
function TimePicker({
  availability,
  selectedDate,
  onSelectTime,
  onSelectBack,
}) {
  const day = availability.find((d) => d.date === selectedDate);
  const grouped = groupByAbbreviation(day.slots);

  return (
    <div className="h-full min-h-0 flex flex-col p-4">
      <div className="text-xs font-semibold">{day.date}</div>
      <div className="text-xs">{day.weekday}</div>

      <div className="flex-1 min-h-0 overflow-y-auto py-2">
        {Object.entries(grouped).map(([abb, slots]) => {
          return (
            <div className="flex flex-col">
              <p className="font-semibold text-sm">{abb}</p>
              <div className="grid grid-cols-4 gap-2 p-2 content-start">
                {slots.map((slot) => (
                  <button
                    key={slot.slice(0, 5)}
                    className="text-sm font-normal rounded-md h-14 border hover:bg-primary/5 hover:border-primary p-1 flex flex-col items-center justify-center transition-all duration-300"
                    onClick={() => onSelectTime(slot)}
                  >
                    {slot.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0 flex flex-row justify-center gap-4">
        <ChatTooltip content="Search for Another Date">
          <button
            className="p-2 rounded-full hover:bg-primary/5 transition-all duration-300"
            onClick={() => onSelectBack()}
          >
            <CalendarSearch className="h-5 w-5 text-slate-600" />
          </button>
        </ChatTooltip>
      </div>
    </div>
  );
}

function DatePicker({ availability, onSelectDate, onSelectBack }) {
  if (!availability) return <div>No Availability Loaded</div>;

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);

  const availableDays = availability.filter((d) => d.slots.length > 0);

  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pagedDays = availableDays.slice(start, end);
  const grouped = groupByYearMonth(pagedDays);

  return (
    <div
      id="main"
      className="w-full flex flex-col flex-1 space-y-4 px-4 h-full"
    >
      <button
        onClick={console.log("Selecting Earliest Not Working For Now")}
        className="mt-6 w-full shrink-0 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
      >
        Book Earliest Available
      </button>

      <div id="picker" className="space-y-4 flex flex-col flex-1 min-h-0 pb-6">
        <div className="flex-1 overflow-y-auto space-y-4">
          {Object.entries(grouped).map(([year, months]) => (
            <div className="" key={year}>
              <div className="text-xs font-semibold">{year}</div>

              {Object.entries(months).map(([month, days]) => (
                <div key={month} className="space-y-1 mb-2">
                  <div className="text-xs">{month}</div>

                  <div className="grid grid-cols-5 gap-2">
                    {days.map((day) => {
                      const dateObj = new Date(day.date);
                      const dayNum = dateObj.getDate();
                      const weekday = dateObj.toLocaleString("en-US", {
                        weekday: "short",
                      });
                      const dayShown = dayNum.toString().padStart(2, "0");

                      return (
                        <button
                          key={day.date}
                          onClick={() => {
                            onSelectDate(day.date);
                          }}
                          className="flex h-14 flex-col items-center justify-center rounded-md border text-xs hover:bg-primary/5"
                        >
                          <span className="text-sm font-semibold">
                            {dayShown}
                          </span>
                          <span className="text-slate-500">{weekday}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          id="nav"
          className="shrink-0 flex items-center justify-between pt-2 bg-white/50"
        >
          {page === 0 ? (
            <button
              onClick={() => onSelectBack()}
              className="rounded-md border px-3 py-1 text-xs hover:bg-primary/5"
            >
              Go Back
            </button>
          ) : (
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border px-3 py-1 text-xs disabled:opacity-40 hover:bg-primary/5"
            >
              Previous
            </button>
          )}
          <span className="text-xs text-slate-500">
            {start + 1}-{Math.min(end, availableDays.length)} of{" "}
            {availableDays.length}
          </span>
          <button
            disabled={end >= availableDays.length}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-xs disabled:opacity-40 hover:bg-primary/5"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
