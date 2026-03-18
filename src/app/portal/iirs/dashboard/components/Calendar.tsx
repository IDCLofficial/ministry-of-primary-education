"use client"
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDate } from '../../context/dateContext';
import { getTransactionData } from '@/lib/iirs/dataInteraction';
import { useAuth } from '../../providers/AuthProvider';

export default function CalendarComponent() {
    const { selectedDate, setSelectedDate } = useDate()
    const {token} = useAuth()
    
    React.useEffect(()=>{
        async function getTransactionDataForDate() {
            if (!token) return
            await getTransactionData(token, 'all', selectedDate?.toISOString().split('T')[0] || undefined)
        }
        getTransactionDataForDate()
        console.log({
            selectedDateWithoutIso: selectedDate,
            selectedDateWithIso: selectedDate?.toISOString().split('T')[0]
        })
    }, [selectedDate])

    return (
        <Calendar
            className={`w-full rounded-md bg-white/20`}
            onChange={(value) => {
                setSelectedDate(value as Date);
            }}
            value={selectedDate}
        />
    );
}