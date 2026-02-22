import React from "react";

import { HelpProvider } from "./help/helpContext";
import type { HelpOpenSource } from "./telemetry/events";

type AppProvidersProps = {
  children: React.ReactNode;
  openHelpTo: (sectionId: string, source?: HelpOpenSource) => void;
};

export function AppProviders({ children, openHelpTo }: AppProvidersProps) {
  return <HelpProvider value={{ openHelpTo }}>{children}</HelpProvider>;
}
