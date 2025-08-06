'use client';

import { useEffect, useState } from 'react';

export default function OfficeHours() {
  const [status, setStatus] = useState('');
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    const checkOfficeStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();

      const isWeekday = day >= 1 && day <= 5;
      const isWorkingHours = hour >= 8 && hour < 16;

      if (!isWeekday) {
        setIsWeekend(true);
        setStatus('Closed');
      } else {
        setIsWeekend(false);
        setStatus(isWorkingHours ? 'Open' : 'Closed');
      }
    };

    checkOfficeStatus();
    const interval = setInterval(checkOfficeStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="office-hours-scroll-text pt-3">
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp; {/* small gap before repeating */}
    </span>
  
    {/* Duplicate for seamless loop */}
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
    <span>
      Office Hours – Monday to Friday: 8:00 AM – 4:00 PM | Office currently:
      <span className={status === 'Open' ? 'text-green-400 ml-1' : 'text-red-400 ml-1'}>
        {status}
      </span>
      {isWeekend && <span className="ml-2 text-yellow-400"> Happy Weekend!</span>}
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
  </div>
  
  );
}
