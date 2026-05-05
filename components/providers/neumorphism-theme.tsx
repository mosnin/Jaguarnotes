"use client";

import { useEffect } from "react";
import { overrideThemeVariables } from "ui-neumorphism";
import "ui-neumorphism/dist/index.css";

export function NeuThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    overrideThemeVariables({
      "--light-bg": "#EDF4FF",
      "--light-bg-dark-shadow": "#C5D5E8",
      "--light-bg-light-shadow": "#FFFFFF",
      "--primary": "#2563EB",
      "--primary-dark": "#1D4ED8",
      "--primary-light": "#93C5FD",
    });
  }, []);

  return <>{children}</>;
}
