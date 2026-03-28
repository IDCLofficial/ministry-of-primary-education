"use client";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarComponent({
  setOpenCalendar,
  setSelectedDate,
  selectedDate
}: {
  setOpenCalendar: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date | null;
}): React.ReactElement {

  return (
    <Calendar
      className={`w-full rounded-md bg-white/20`}
      onChange={(value) => {
        setSelectedDate(value as Date);
        setOpenCalendar(false)
      }}
      value={selectedDate}
    />
  );
}
