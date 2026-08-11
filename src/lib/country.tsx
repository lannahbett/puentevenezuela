import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type CountryScope } from "./countries";

type Ctx = {
  scope: CountryScope;
  setScope: (s: CountryScope) => void;
};

const CountryCtx = createContext<Ctx | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<CountryScope>("all");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("country") : null;
    if (stored === "VE" || stored === "CO" || stored === "all") setScopeState(stored);
  }, []);

  const setScope = (s: CountryScope) => {
    setScopeState(s);
    if (typeof window !== "undefined") localStorage.setItem("country", s);
  };

  return <CountryCtx.Provider value={{ scope, setScope }}>{children}</CountryCtx.Provider>;
}

export function useCountry() {
  const ctx = useContext(CountryCtx);
  if (!ctx) throw new Error("useCountry must be used inside CountryProvider");
  return ctx;
}
