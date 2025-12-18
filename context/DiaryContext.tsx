// context/DiaryContext.tsx
import { useDiary } from "@/hooks/useDiary";
import { createContext, useContext } from "react";

const DiaryContext = createContext<ReturnType<typeof useDiary> | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const diary = useDiary();
  return (
    <DiaryContext.Provider value={diary}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiaryContext() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error("useDiaryContext must be used inside DiaryProvider");
  return ctx;
}
