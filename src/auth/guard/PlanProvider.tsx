// /hook/guard/PlanProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

interface PlanContextValue {
  features: Record<string, string>;
}

const PlanContext = createContext<PlanContextValue>({ features: {} });

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const features = session?.user.features ?? {};
  return <PlanContext.Provider value={{ features }}>{children}</PlanContext.Provider>;
};

export const usePlan = () => useContext(PlanContext);