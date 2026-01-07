const services = [
  {
    id: "consultation",
    name: "Online Consultation",
  },
  {
    id: "assessment",
    name: "In-Person Assessment",
  },
];

export default function ConfirmBooking({
  slot,
  service,
  onConfirm,
  onBack,
  loading,
}) {
  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow-md">
      <h3 className="text-sm font-semibold text-slate-800">
        Confirm Appointment
      </h3>

      <div className="text-sm text-slate-600 bg-primary/5 py-4 text-center m-4">
        <p>
          <strong>{slot.weekday}</strong>, {slot.date} at {slot.time}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {services.find((item) => item.id === service).name}
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-slate-100 transition-all duration-300 ease-out"
        >
          Back
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50 transition-all duration-300 ease-out"
        >
          {loading ? "Booking…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
