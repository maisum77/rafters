"use client";

import { useEffect, useRef, useState } from "react";

export const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3pRecgYRd8XolL6tJruk1t56EEitb_heWcEe2VHPOvpkHQEjTEaiFZZ4o-ozAc8rxqbJcQ3y-c?gv=true";

/**
 * The Google Calendar widget pulls in dozens of third-party requests
 * (gstatic JS/CSS, reCAPTCHA). It's only mounted once the user scrolls
 * close to the booking section, so weak machines don't pay that cost
 * (or the WebGL scene's frame budget) on every page load.
 */
export function BookingEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full max-w-[560px]">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface-2/70">
        {visible ? (
          <iframe
            src={BOOKING_URL}
            title="Book a call with Rafters"
            style={{ border: 0, display: "block", background: "transparent" }}
            width="100%"
            height="680"
            frameBorder="0"
            allow="calendar"
          />
        ) : (
          <div className="flex h-[680px] items-center justify-center">
            <span className="font-serif text-lg italic text-muted">
              Loading availability…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}