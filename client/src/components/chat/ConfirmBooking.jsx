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

      <div className="text-sm text-slate-600">
        <p>
          <strong>{slot.weekday}</strong>, {slot.date}
        </p>
        <p>{slot.time}</p>
        <p className="mt-1 text-xs text-slate-500">{service}</p>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-slate-100"
        >
          Back
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Booking…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}
