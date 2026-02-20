export const MODES = Object.freeze({
  ENTRY: "entry",
  APPOINTMENT: "appointment",
  MANAGE: "manage",
  SCHEDULE: "schedule",
  QUESTION: "question",
  CHAT: "chat",
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
