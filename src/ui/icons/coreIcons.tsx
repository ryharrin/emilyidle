import type * as React from "react";

import { ArrowUp, CircleQuestionMark, DollarSign, Heart, Lock, RotateCcw } from "lucide-react";

export function HelpIcon(props: React.ComponentProps<typeof CircleQuestionMark>): JSX.Element {
  return <CircleQuestionMark {...props} aria-hidden={true} focusable={false} />;
}

export function LockIcon(props: React.ComponentProps<typeof Lock>): JSX.Element {
  return <Lock {...props} aria-hidden={true} focusable={false} />;
}

export function PrestigeIcon(props: React.ComponentProps<typeof RotateCcw>): JSX.Element {
  return <RotateCcw {...props} aria-hidden={true} focusable={false} />;
}

export function CurrencyIcon(props: React.ComponentProps<typeof DollarSign>): JSX.Element {
  return <DollarSign {...props} aria-hidden={true} focusable={false} />;
}

export function UpgradeIcon(props: React.ComponentProps<typeof ArrowUp>): JSX.Element {
  return <ArrowUp {...props} aria-hidden={true} focusable={false} />;
}

export function EnjoymentIcon(props: React.ComponentProps<typeof Heart>): JSX.Element {
  return <Heart {...props} aria-hidden={true} focusable={false} />;
}
