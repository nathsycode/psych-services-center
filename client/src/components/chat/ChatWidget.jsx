import { useState, useEffect, useRef, useReducer, useMemo } from "react";
import {
  Loader2,
  MessageCircle,
  X,
  Send,
  Undo2,
  CircleAlert,
  CalendarSearch,
  Calendar,
  Clock,
  ArrowLeft,
  Video,
  Brain,
  User,
  ChartNoAxesGantt,
} from "lucide-react";
import { sendChatMessage } from "../../lib/chatApi";
import { Tooltip, Form } from "radix-ui";
import useDevShortcuts from "../../hooks/useDevShortcuts";

const STORAGE_KEY = "chat_widget_state";
const VITE_CALENDAR_AVAILABILITY_URL = import.meta.env
  .VITE_CALENDAR_AVAILABILITY_URL;
const VITE_BOOKING_URL = import.meta.env.VITE_BOOKING_URL;
const VITE_LOOKUP_URL = import.meta.env.VITE_LOOKUP_URL;
// const VITE_BOOKING_URL = import.meta.env.VITE_TEST_BOOKING_URL;

// HACK: TESTING ONLY

// const VITE_CALENDAR_AVAILABILITY_URL =
//   "http://localhost:5678/webhook-test/calendar/availability";
const DEV = import.meta.env.DEV;

export const MODES = Object.freeze({
  ENTRY: "entry",
  APPOINTMENT: "appointment",
  MANAGE: "manage",
  SCHEDULE: "schedule",
  QUESTION: "question",
  CHAT: "chat",
});

const SUBMODES = Object.freeze({
  APPOINTMENT: Object.freeze({
    SCHEDULE: "schedule",
    MANAGE: "manage",
    // CANCEL: "cancel", TODO: Don't forget to fix
    // RESCHEDULE: "reschedule",
  }),
  QUESTION: Object.freeze({
    SERVICES: "services",
    CONTACT: "contact",
    PRICING: "pricing",
    OTHERS: "others",
  }),
});

export const ACTION_TYPES = Object.freeze({
  START_BOOKING: "start",
  SELECT_SERVICE: "service",
  SELECT_DATE: "date",
  SELECT_TIME: "time",
  BACK_TO_DATE: "back_date",
  BACK_TO_TIME: "back_time",
  RESET: "reset",
  SUBMIT_DETAILS: "submit",
  BOOKING_SUCCESS: "booking_success",
  BOOKING_FAILURE: "booking_failure",
  LOOKUP_INITIATE: "initiate_lookup",
  LOOKUP_SUCCESS: "lookup_success",
  LOOKUP_FAILURE: "lookup_failure",
  DEV_FORCE_SUBMIT: "dev_force_submit",
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
        sub: SUBMODES.APPOINTMENT.MANAGE,
        subDesc: "Manage",
        userMsg: "I would like to manage an existing an appointment",
        botMsg: "Sure! Please provide your appointment code.",
      },
      // {
      //   sub: SUBMODES.APPOINTMENT.CANCEL,
      //   subDesc: "Cancel",
      //   userMsg: "I would like to cancel an upcoming appointment",
      //   botMsg:
      //     "Sorry to hear that. To proceed, kindly confirm your full name and email address.",
      // },
      // {
      //   sub: SUBMODES.APPOINTMENT.RESCHEDULE,
      //   subDesc: "Reschedule",
      //   userMsg: "I would like to reschedule an existing appointment",
      //   botMsg:
      //     "I'd love to assist -- To proceed, please provide your full name, email address and your preferred date and time for the new schedule.",
      // },
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

function applyEntryAction(choice, setMessages) {
  const entry = entryActions.find((a) => a.action === choice);

  if (!entry) return;

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

  if (!res.ok) {
    const errorData = await res.json();
    return {
      result: "error",
      error: {
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message:
          errorData.error?.message ||
          "A booking error occured. Please try again later.",
        retryable: errorData.error?.retryable === true,
      },
    };
  }

  const data = await res.json();

  return data;
}

async function verifyAppointmentCode(appCode) {
  const res = await fetch(VITE_LOOKUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appCode }),
  });

  if (!res.ok) {
    const err = await res.json();
    return {
      result: "error",
      error: {
        code: err.error?.code || "LOOKUP_UNKNOWN_ERROR",
        message:
          err.error?.message ||
          "Unable to verify appointment code. Please try again later.",
        retryable: err.error?.retryable === true,
      },
    };
  }

  const data = await res.json();

  console.log(data);

  return data;
}

function applySubAction(entry, choice, setMessages) {
  const subAction = entry.subactions.find((sub) => sub.sub === choice);

  if (!subAction) return;

  setMessages((m) =>
    [
      ...m,
      subAction.userMsg && inputChat("user", subAction.userMsg),
      subAction.botMsg && inputChat("assistant", subAction.botMsg),
    ].filter(Boolean),
  );
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
  LOOKUP: "lookup",
});

const MANAGE_STEPS = Object.freeze({
  CODE: "code",
  LOADING: "loading",
  DETAILS: "details",
  ERROR: "error",
});

const bookingInitialState = {
  step: BOOKING_STEPS.IDLE, // idle | service | date | time | details | submitting | done
  service: null,
  date: null,
  time: null,
  contact: null,
  result: null,
  error: null,
  lookupResult: null,
  lookupError: null,
};

function bookingReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return bookingInitialState;

    case ACTION_TYPES.START_BOOKING:
      return {
        ...bookingInitialState,
        step: BOOKING_STEPS.SERVICE,
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

    case ACTION_TYPES.BOOKING_SUCCESS:
      return {
        ...state,
        step: BOOKING_STEPS.DONE,
        result: action.result,
      };

    case ACTION_TYPES.BOOKING_FAILURE:
      return {
        ...state,
        step: BOOKING_STEPS.DONE,
        result: action.result,
        error: action.error,
      };

    case ACTION_TYPES.LOOKUP_INITIATE:
      return {
        ...state,
        step: BOOKING_STEPS.LOOKUP,
        lookupResult: null,
        lookupError: null,
      };

    case ACTION_TYPES.LOOKUP_SUCCESS:
      return {
        ...state,
        step: BOOKING_STEPS.DONE,
        lookupResult: action.result,
        lookupError: null,
      };

    case ACTION_TYPES.LOOKUP_FAILURE:
      return {
        ...state,
        step: BOOKING_STEPS.DETAILS,
        lookupResult: null,
        lookupError: action.error,
      };

    case ACTION_TYPES.DEV_FORCE_SUBMIT:
      return {
        step: BOOKING_STEPS.SUBMITTING,
        service: action.service,
        date: action.date,
        time: action.time,
        contact: action.contact,
      };

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
  const [availabilityTimedOut, setAvailabilityTimedOut] = useState(false);

  const [booking, dispatchBooking] = useReducer(
    bookingReducer,
    bookingInitialState,
  );

  useDevShortcuts({ setShowDebug, dispatchBooking, setMode });

  const fetchAvailability = () => {
    if (!booking.service) return;

    setLoadingAvailability(true);
    setAvailabilityError(null);
    setAvailabilityTimedOut(false);

    getAvailability(booking.service)
      .then((data) => {
        console.log("setting availability", data);
        setAvailability(data);
      })
      .catch((err) => {
        console.error(err);
        setAvailabilityError(
          "Unable to load availability. Please try again later.",
        );
      })
      .finally(() => setLoadingAvailability(false));
  };

  useEffect(() => {
    // Local Storage
    saveState({
      sessionId,
      messages,
      hasGreeted,
      mode,
    });
  }, [sessionId, messages, hasGreeted, mode]);

  useEffect(() => {
    // Debugging
    console.log("BOOKING STATE", booking);
  }, [booking]);

  // NOTE: Fetch Availability
  useEffect(() => {
    fetchAvailability();
  }, [booking.service]);

  useEffect(() => {
    if (booking.step !== BOOKING_STEPS.LOOKUP_INITIATE) return;

    console.log("Booking step");


  }, [booking.step])

  const processBookingSubmission = async () => {
    setBookingLoading(true);

    try {
      const result = await bookAppointment({
        service: booking.service,
        date: booking.date,
        time: booking.time,
        name: booking.contact.fullName,
        email: booking.contact.email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (result.result === "success") {
        dispatchBooking({ type: ACTION_TYPES.BOOKING_SUCCESS, result: result });
        setMessages((m) => [
          ...m,
          inputChat(
            "assistant",
            "✅ Thank you! Your appointment has been booked. You'll receive a confirmation email shortly.",
          ),
        ]);
      } else {
        console.error("Booking submission error", result);

        const errorMessage =
          result.error?.message || "An unexpected error occured.";
        const retryable = result.error?.retryable || false;

        dispatchBooking({
          type: ACTION_TYPES.BOOKING_FAILURE,
          result: result,
          error: result.error,
        });

        setMessages((m) => [
          ...m,
          inputChat(
            "assistant",
            `❌ ${errorMessage} ${retryable ? "Please try again." : ""}`,
          ),
        ]);
      }

      return result;
    } catch (unexpectedError) {
      console.error("Unexpected booking submission error", unexpectedError);

      dispatchBooking({
        type: ACTION_TYPES.BOOKING_FAILURE,
        result: { result: "error" },
        error: {
          code: "UNEXPECTED_EXCEPTION",
          message:
            "A server network or unexpected error occured. Please check your internet connection and try again.",
          retryable: true,
        },
      });

      setMessages((m) => [
        ...m,
        inputChat(
          "assistant",
          `❌ An error occured. Please check your network and try again`,
        ),
      ]);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (booking.step !== BOOKING_STEPS.SUBMITTING) return;

    processBookingSubmission();
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

  const confirmBooking = async () => {
    return await processBookingSubmission();
  };

  const showChatMessages =
    mode !== MODES.APPOINTMENT &&
    mode !== MODES.MANAGE
    ||
    (
      mode === MODES.APPOINTMENT &&
      (
        booking.step === BOOKING_STEPS.IDLE ||
        booking.step === BOOKING_STEPS.SERVICE
      )
    );

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
              <p>{booking.step ? booking.step : ""}</p>
              <p>{ }</p>
              {/* {booking.service && <p>{booking.service}</p>} */}
            </div>
          )}
          {/* NOTE: ChatMessages should show when booking step is not idle */}

          {showChatMessages && <ChatMessages messages={messages} isTyping={isTyping} />
          }

          {mode === MODES.MANAGE && (
            <ManageFlow
              verifyAppointmentCode={verifyAppointmentCode}
              onExit={() => {
                setMode(MODES.ENTRY);
                setEntryPhase(ENTRY_PHASES.ROOT)
              }}
            />

          )}

          {mode === MODES.APPOINTMENT && (
            <BookingFlow
              booking={booking}
              availability={availability}
              dispatchBooking={dispatchBooking}
              loadingAvailability={loadingAvailability}
              availabilityError={availabilityError}
              onDone={() => {
                dispatchBooking({ type: ACTION_TYPES.RESET });
                setMode(MODES.CHAT);
              }}
              availabilityTimedOut={availabilityTimedOut}
              setAvailabilityTimedOut={setAvailabilityTimedOut}
              fetchAvailability={fetchAvailability}
              setMode={setMode}
              setEntryPhase={setEntryPhase}
              processBookingSubmission={processBookingSubmission}
              bookingLoading={bookingLoading}
            />
          )}

          {mode === MODES.ENTRY && entryPhase === ENTRY_PHASES.ROOT && (
            <EntryActions
              onSelect={(choice) => {
                applyEntryAction(choice, setMessages);
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

          {mode === MODES.ENTRY && entryPhase === ENTRY_PHASES.APPOINTMENT && (
            <SubActions
              subactions={
                entryActions.find((act) => act.action === MODES.APPOINTMENT)
                  .subactions
              }
              onSelect={(choice) => {
                const entry = entryActions.find(
                  (act) => act.action === MODES.APPOINTMENT,
                );
                applySubAction(entry, choice, setMessages);
                if (choice === SUBMODES.APPOINTMENT.SCHEDULE) {
                  dispatchBooking({ type: ACTION_TYPES.START_BOOKING });
                  setEntryPhase(ENTRY_PHASES.NONE);
                  setMode(MODES.APPOINTMENT);
                }

                if (choice === SUBMODES.APPOINTMENT.MANAGE) {
                  setEntryPhase(ENTRY_PHASES.NONE);
                  setMode(MODES.MANAGE);
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
                applySubAction(MODES.QUESTION, choice,
                  setMessages,
                );
              }}
            />
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
  return (
    <div className="space-y-2 mt-4 px-4 flex flex-col">
      {subactions.map((sub) => {
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

  console.log("get availability", data);

  return data.availability;
};

function BookingFlow({
  booking,
  availability,
  dispatchBooking,
  loadingAvailability,
  availabilityError,
  onDone,
  availabilityTimedOut,
  setAvailabilityTimedOut,
  fetchAvailability,
  setMode,
  setEntryPhase,
  processBookingSubmission,
  bookingLoading,
}) {
  // if (!availability) return null;

  console.log(availability)

  const needsAvailability =
    booking.step !== BOOKING_STEPS.IDLE &&
    booking.step !== BOOKING_STEPS.SERVICE;

  if (needsAvailability) {
    if (availabilityError)
      return (
        <ErrorMessage
          message={availabilityError}
          retryable
          onRetry={() => fetchAvailability()}
          onCancel={() => {
            dispatchBooking({ type: ACTION_TYPES.RESET });
            setMode(MODES.ENTRY);
            setEntryPhase(ENTRY_PHASES.ROOT);
          }}
        />
      );

    if (loadingAvailability && !availabilityTimedOut)
      return (
        <Loading
          label="Loading availability..."
          timeoutMs={8000}
          onTimeout={() => {
            console.log("timed out");
            setAvailabilityTimedOut(true);
          }}
        />
      );

    if (availabilityTimedOut) {
      return (
        <ErrorMessage
          message="This is taking longer than expected."
          retryable
          onRetry={() => {
            setAvailabilityTimedOut(false);
            fetchAvailability();
          }}
          onCancel={() => {
            dispatchBooking({ type: ACTION_TYPES.RESET });
            setMode(MODES.ENTRY);
            setEntryPhase(ENTRY_PHASES.ROOT);
          }}
        />
      );
    }

    if (!availability || availability.length === 0)
      return (
        <Empty
          message="No available times found. Please try again later or contact support at support@mindcare.ph."
          onRetry={() => fetchAvailability()}
          onCancel={() => {
            dispatchBooking({ type: ACTION_TYPES.RESET });
            setMode(MODES.ENTRY);
            setEntryPhase(ENTRY_PHASES.ROOT);
          }}
        />
      );
  }

  switch (booking.step) {
    case BOOKING_STEPS.SERVICE:
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
          <Spinner label="Booking your appointment..." />
        </div>
      );

    case BOOKING_STEPS.DONE:
      return (
        <BookingConfirmation
          booking={booking}
          onDone={onDone}
          onRetryBooking={processBookingSubmission}
          setMode={setMode}
          setEntryPhase={setEntryPhase}
          dispatchBooking={dispatchBooking}
          bookingLoading={bookingLoading}
        />
      );
    default:
      return null;
  }
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
        onClick={() => onSelectDate(availableDays[0].date)}
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

function BookingConfirmation({
  booking,
  onDone,
  onRetryBooking,
  setMode,
  setEntryPhase,
  dispatchBooking,
  bookingLoading,
}) {
  const date = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (booking.error) {
    const errorMessage =
      booking.error.message ||
      "Something went wrong during booking. Please try again.";
    const retryable = booking.error.retryable;

    return (
      <ErrorMessage
        message={errorMessage}
        retryable={retryable}
        onRetry={onRetryBooking}
        onCancel={() => {
          dispatchBooking({ type: ACTION_TYPES.RESET });
          setMode(MODES.ENTRY);
          setEntryPhase(ENTRY_PHASES.ROOT);
        }}
        isLoading={bookingLoading}
      />
    );
  }

  return (
    <div className="p-4 gap-2 flex flex-col">
      <p className="text-slate-900 font-semibold text-lg">
        Your meeting is scheduled!
      </p>
      <p className="text-slate-600 text-sm">
        An email with meeting details have been sent to {booking.contact.email}.
      </p>

      <div className="flex flex-col gap-2 p-4 border border-slate-400 rounded-md mx-4 mt-4">
        <h1 className="flex flex-row gap-2 group items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-semibold text-lg">MindCare Center</span>
        </h1>
        <h3 className="text-center text-sm">
          {booking.service === "consultation"
            ? "Online Mental Health Consultation"
            : booking.service === "assessment"
              ? "In-Person Psychological Assessment"
              : ""}
        </h3>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {booking.contact.fullName}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {date}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {booking.time}
            </span>
          </div>
          {booking.result?.data?.callLink && (
            <ChatTooltip content={booking.result.data.callLink}>
              <a
                href={booking.result.data.callLink}
                target="_blank"
                className="btn-primary flex flex-row gap-2 items-center group"
              >
                <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-600 underline group-hover:text-primary group-hover:font-semibold transition-all duration-300">
                  Link to Call
                </span>
              </a>
            </ChatTooltip>
          )}
          {booking.result?.data?.manageLink && (
            <ChatTooltip content={booking.result.data.manageLink}>
              <a
                href={booking.result.data.manageLink}
                target="_blank"
                className="btn-primary flex flex-row gap-2 items-center group"
              >
                <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
                  <ChartNoAxesGantt className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-600 underline group-hover:text-primary group-hover:font-semibold transition-all duration-300">
                  Manage Booking
                </span>
              </a>
            </ChatTooltip>
          )}
        </div>
      </div>
      <button
        onClick={onDone}
        className="text-xs text-slate-600 underline pt-2 hover:text-primary px-2 mx-auto"
      >
        Back to Chat
      </button>
    </div>
  );
}

function ManageFlow({ verifyAppointmentCode, onExit }) {
  const [step, setStep] = useState(MANAGE_STEPS.CODE);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmitCode = async (code) => {
    setStep(MANAGE_STEPS.LOADING);
    setError(null);

    const res = await verifyAppointmentCode(code);

    console.log(res);

    if (res.result === 'success') {
      setAppointment(res.data);
      setStep(MANAGE_STEPS.DETAILS);
    } else {
      setError(res.error);
      setStep(MANAGE_STEPS.ERROR);
    }
  };

  switch (step) {
    case MANAGE_STEPS.CODE:
    case MANAGE_STEPS.ERROR:
      return (
        <AppointmentCodeForm
          onSubmit={handleSubmitCode}
          onBack={onExit}
          lookupError={error}
          isLoading={step === MANAGE_STEPS.LOADING}
        />
      )
    case MANAGE_STEPS.LOADING:
      return <Spinner label="Verifying appointment..." />

    case MANAGE_STEPS.DETAILS:
      return (
        <ManageAppointmentDetails
          appointment={appointment}
          onBack={onExit}
        />
      )


    default:
      break;
  }

  return (
    <div>Manage Flow</div>
  )
}

function ManageAppointmentDetails({ appointment, onBack }) {

  return (

    <div className="p-4 gap-2 flex flex-col">
      <div className="flex flex-col gap-2 p-4 border border-slate-400 rounded-md mx-4 mt-4">
        <h1 className="flex flex-row gap-2 group items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-semibold text-lg">MindCare Center</span>
        </h1>
        <h3 className="text-center text-sm">
          {appointment.service}
        </h3>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {appointment.name}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {appointment.date}
            </span>
          </div>
          <div className="flex flex-row gap-2 items-center group">
            <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600 group-hover:text-primary group-hover:font-semibold transition-all duration-300">
              {appointment.time}
            </span>
          </div>
          {appointment.callLink && (
            <ChatTooltip content={appointment.callLink}>
              <a
                href={appointment.callLink}
                target="_blank"
                className="btn-primary flex flex-row gap-2 items-center group"
              >
                <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-600 underline group-hover:text-primary group-hover:font-semibold transition-all duration-300">
                  Link to Call
                </span>
              </a>
            </ChatTooltip>
          )}
          {appointment.manageLink && (
            <ChatTooltip content={appointment.manageLink}>
              <a
                href={appointment.manageLink}
                target="_blank"
                className="btn-primary flex flex-row gap-2 items-center group"
              >
                <div className="p-2 text-slate-600 group-hover:text-white group-hover:bg-primary transition-all duration-300 ease-in-out rounded-full">
                  <ChartNoAxesGantt className="h-4 w-4" />
                </div>
                <span className="text-sm text-slate-600 underline group-hover:text-primary group-hover:font-semibold transition-all duration-300">
                  Manage Booking
                </span>
              </a>
            </ChatTooltip>
          )}
        </div>
      </div>
      <button
        onClick={onBack}
        className="text-xs text-slate-600 underline pt-2 hover:text-primary px-2 mx-auto"
      >
        Back to Chat
      </button>
    </div>
  )
}

function AppointmentCodeForm({ onSubmit, onBack, lookupError, isLoading }) {
  const [appCode, setAppCode] = useState("");
  const canSubmit = appCode.trim();

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4">
      <div className="w-full flex flex-col px-4 py-4 border-b border-slate-200 mb-4">
        <p className="font-semibold text-lg text-slate-900">
          Manage Appointment
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Please enter your unique appointment code to view or modify your
          booking.
        </p>
      </div>
      <div>
        <Form.Root
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit || isLoading) return;
            onSubmit(appCode.trim());
          }}
        >
          <Form.Field>
            <div>
              <Form.Label className="text-[15px] font-medium leading-[35px]">Appointment Code*</Form.Label>
              {lookupError && (
                <Form.Message
                  id="code-error"
                  className="text-[13px] text-red-500 opacity-80"
                >
                  {lookupError.message}
                </Form.Message>
              )}
            </div>
            <Form.Control asChild>
              <input
                className="box-border inline-flex h-[35px] w-full appearance-none items-center justify-center rounded-md px-2.5 text-[15px] leading-none text-black border border-slate-400 focus:outline-none focus:border-primary focus:border-2 transition-colors duration-300"
                required
                type="text"
                name="appCode"
                placeholder="Your appointment code ..."
                value={appCode}
                aria-describedby="code-error"
                onChange={(e) => setAppCode(e.target.value)}
              />
            </Form.Control>
          </Form.Field>
          <div className="flex flex-row items-center justify-between gap-3 mt-3">
            <ChatTooltip content="Go Back to Main Menu">
              <button
                type="button"
                className="border border-slate-500 px-3 py-2 rounded-full group flex flex-row gap-2 duration-300 transition-all ease-in-out hover:bg-primary/5 hover:border-primary"
                onClick={() => onBack()}
                aria-label="Go Back"
                disabled={isLoading}
              >
                <ArrowLeft className="h-5 w-5 text-slate-500 transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:text-primary" />
              </button>
            </ChatTooltip>
            <Form.Submit asChild>
              <button
                disabled={!canSubmit || isLoading}
                className="flex-1 rounded-full px-3 py-2 bg-primary text-white transition-colors duration-300 ease-in-out hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Spinner label="Verifying..." /> : "Verify Code"}
              </button>
            </Form.Submit>
          </div>
        </Form.Root>
      </div>
    </div>
  );
}

function Loading({ label = "Loading availability...", timeoutMs, onTimeout }) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
  }, [timeoutMs]);

  useEffect(() => {
    if (!timeoutMs) return;

    const id = setTimeout(() => {
      setTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => {
      clearTimeout(id);
    };
  }, [timeoutMs, onTimeout]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Spinner label={label} />
      {timedOut && (
        <div className="text-sm text-slate-500 text-center px-4">
          This is taking longer than expected...
        </div>
      )}
    </div>
  );
}

function ErrorMessage({ message, retryable, onRetry, onCancel, isLoading }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center flex-1">
      <CircleAlert className="h-8 w-8 mb-2 text-red-500" />
      <p className="text-sm text-slate-600">{message}</p>
      {retryable && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onRetry}
            disabled={isLoading}
            className={`rounded-full px-4 py-2 text-white text-sm ${isLoading ? "border border-slate-400 hover:bg-slate-100 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          >
            {isLoading ? <Spinner label="Retrying..." /> : "Retry"}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-red-500 px-4 py-2 text-red-500 text-sm hover:bg-red-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function Empty({ message, onRetry, onCancel }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center flex-1">
      <CircleAlert className="h-8 w-8 mb-2 text-primary" />
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex gap-2 mt-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-primary px-4 py-2 text-white text-sm hover:bg-primary/90"
          >
            Try Again
          </button>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full border border-slate-500 px-4 py-2 text-slate-700 text-sm hover:bg-slate-100"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
