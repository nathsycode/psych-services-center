export default function useDevShortcuts({
  setShowDebug,
  dispatchBooking,
  setMode,
}) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "B") {
        setMode(MODES.APPOINTMENT);
        dispatchBooking({
          type: ACTION_TYPES.DEV_FORCE_SUBMIT,
          service: "consultation",
          date: "2026-01-21",
          time: "12:00 PM",
          contact: { fullName: "Dev Test", email: "dev@test.com" },
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
