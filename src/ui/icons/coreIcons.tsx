import type * as React from "react";

import { CircleQuestionMark, Lock, RotateCcw } from "lucide-react";

export function HelpIcon(props: React.ComponentProps<typeof CircleQuestionMark>): JSX.Element {
  return <CircleQuestionMark {...props} aria-hidden={true} focusable={false} />;
}

export function LockIcon(props: React.ComponentProps<typeof Lock>): JSX.Element {
  return <Lock {...props} aria-hidden={true} focusable={false} />;
}

export function PrestigeIcon(props: React.ComponentProps<typeof RotateCcw>): JSX.Element {
  return <RotateCcw {...props} aria-hidden={true} focusable={false} />;
}
