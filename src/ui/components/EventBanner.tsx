import React from "react";

import { formatDurationFromMs } from "../../game/format";

type ActiveEvent = {
  id: string;
  name: string;
  incomeMultiplier: number;
  remainingMs: number;
};

type EventBannerProps = {
  activeEvents: ActiveEvent[];
};

export function EventBanner({ activeEvents }: EventBannerProps) {
  if (activeEvents.length === 0) return null;

  return (
    <section className="event-banner" data-testid="event-banner" aria-live="polite">
      {activeEvents.map((event) => (
        <div
          key={event.id}
          className="event-banner__item"
          data-event={event.id}
          data-testid={`event-banner-${event.id}`}
        >
          <span className="event-banner__icon" aria-hidden="true">
            {event.id === "valentines-day" ? "💝" : "🎉"}
          </span>
          <span className="event-banner__name">{event.name}</span>
          <span className="event-banner__multiplier">×{event.incomeMultiplier.toFixed(2)}</span>
          <span className="event-banner__time">{formatDurationFromMs(event.remainingMs)}</span>
        </div>
      ))}
    </section>
  );
}
