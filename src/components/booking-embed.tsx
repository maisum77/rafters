export const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3pRecgYRd8XolL6tJruk1t56EEitb_heWcEe2VHPOvpkHQEjTEaiFZZ4o-ozAc8rxqbJcQ3y-c?gv=true";

export function BookingEmbed() {
  return (
    <div className="w-full max-w-[560px]">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface-2/70">
        <iframe
          src={BOOKING_URL}
          title="Book a call with Rafters"
          style={{ border: 0, display: "block", background: "transparent" }}
          width="100%"
          height="680"
          frameBorder="0"
          allow="calendar"
        />
      </div>
    </div>
  );
}