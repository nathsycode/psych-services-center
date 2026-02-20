const MOCKS = {
  CHAT_REPLY: "This is a demo response. Live API is disabled.",
  AVAILABILITY: [
    { date: "2026-02-25", weekday: "Wed", slots: ["09:00 AM", "10:00 AM"] },
    { date: "2026-02-26", weekday: "Thurs", slots: ["11:00 AM", "12:00 PM"] },
  ],
  BOOKING_RESULT: {
    result: "success",
    data: {
      callLink: "https://mindcare.ph/appointment/success-sample",
      manageLink: "https://mindcare.ph/appointment/manage-sample",
    },
  },
  LOOKUP_BY_CODE: {
    DEMO123: {
      result: "success",
      data: {
        code: "DEMO123",
        service: "Online Mental Health Consultation",
        name: "Demo User",
        date: "2026-02-25",
        time: "10:00 AM",
        callLink: "https://meet.google.com/demo-call",
        manageLink: "https://mindcare.ph/manage/demo123",
      },
    },
    ASSESS456: {
      result: "success",
      data: {
        code: "ASSESS456",
        service: "In-Person Psychological Assessment",
        name: "Alex Rivera",
        date: "2026-02-26",
        time: "11:00 AM",
      },
    },
  },
  LOOKUP_NOT_FOUND: {
    result: "error",
    error: {
      code: "LOOKUP_NOT_FOUND",
      message: "No booking found for that appointment code.",
      retryable: false,
    },
  },
};

export default MOCKS;
