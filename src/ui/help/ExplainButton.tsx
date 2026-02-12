import React from "react";

import { HelpIcon } from "../icons/coreIcons";
import { emitTelemetryEvent } from "../telemetry/emitter";
import { TELEMETRY_EVENTS } from "../telemetry/events";
import { useHelp } from "./helpContext";

type ExplainButtonProps = {
  sectionId: string;
  label?: string;
  className?: string;
};

export function ExplainButton({ sectionId, label, className }: ExplainButtonProps): JSX.Element {
  const { openHelpTo } = useHelp();

  const classes = ["explain-button", className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-label={label ?? "Explain"}
      data-testid={`explain-${sectionId}`}
      onClick={() => {
        emitTelemetryEvent(TELEMETRY_EVENTS.explainClick, { sectionId });
        openHelpTo(sectionId, "explain-button");
      }}
    >
      <HelpIcon size={16} />
    </button>
  );
}
