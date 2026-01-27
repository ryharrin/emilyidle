import React from "react";

import { HelpIcon } from "../icons/coreIcons";
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
      onClick={() => openHelpTo(sectionId)}
    >
      <HelpIcon size={16} />
    </button>
  );
}
