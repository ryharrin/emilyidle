import React, { createContext, useContext } from "react";

import type { HelpOpenSource } from "../telemetry/events";

export type HelpContextValue = {
  openHelpTo: (sectionId: string, source?: HelpOpenSource) => void;
};

const HelpContext = createContext<HelpContextValue | null>(null);

type HelpProviderProps = {
  value: HelpContextValue;
  children: React.ReactNode;
};

export function HelpProvider({ value, children }: HelpProviderProps): JSX.Element {
  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp(): HelpContextValue {
  const ctx = useContext(HelpContext);
  if (!ctx) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return ctx;
}
