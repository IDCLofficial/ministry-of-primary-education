"use client"

import { createContext, useContext, useState} from 'react';

interface DateContextType {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>  
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}
