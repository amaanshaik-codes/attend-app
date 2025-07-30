'use client';
import React from 'react';

interface HeatmapProps {
  attendanceDates: string[];
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKS_TO_SHOW = 27; // Approx 6 months

// Helper to get the start of the day to avoid timezone issues
const getDayStart = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
};


const AttendanceHeatmap: React.FC<HeatmapProps> = ({ attendanceDates }) => {
  const attendanceSet = new Set(attendanceDates);

  const today = getDayStart(new Date());
  
  const days = [];
  // Calculate the start date to be from the beginning of our grid, then rewind to the previous Sunday
  const startDate = getDayStart(new Date());
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW * 7 - 1));
  const dayOfWeek = startDate.getUTCDay(); // 0 for Sunday
  startDate.setDate(startDate.getDate() - dayOfWeek);

  // Render a full grid of days to ensure it's not jagged
  for (let i = 0; i < WEEKS_TO_SHOW * 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  
  const monthLabels = MONTHS.map((monthName, index) => {
      const firstOfMonth = days.findIndex(day => day.getUTCMonth() === index && day.getUTCDate() === 1 && day <= today);
      if (firstOfMonth === -1) return null;
      const weekIndex = Math.floor(firstOfMonth / 7);
      return { name: monthName, weekIndex };
  }).filter(Boolean) as { name: string, weekIndex: number }[];

  return (
    <div className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="overflow-x-auto pb-2 -mb-2">
        <div className="relative h-6 mb-2" style={{ minWidth: `${WEEKS_TO_SHOW * 1.125}rem`}}>
            {monthLabels.map((label) => (
                <div key={label.name} className="absolute text-xs text-gray-500 dark:text-gray-400" style={{ left: `calc(${label.weekIndex} * (0.875rem + 4px))` }}>
                {label.name}
                </div>
            ))}
        </div>
        <div className="flex gap-3">
            {/* Weekday Labels */}
            <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 gap-1">
                {WEEK_DAYS.map((day, i) => (
                    <div key={day} className="h-3.5 flex items-center">
                        {i % 2 !== 0 ? day : ''}
                    </div>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1">
            {days.map((d) => {
                const dateString = d.toISOString().slice(0, 10);
                const isPresent = attendanceSet.has(dateString);
                const isFuture = d > today;

                let colorClass = 'bg-gray-200 dark:bg-gray-700'; // Default/Absent
                if (isFuture) {
                colorClass = 'bg-gray-100 dark:bg-gray-800 opacity-60'; // Future
                } else if (isPresent) {
                colorClass = 'bg-green-500'; // Present
                }
                
                return (
                <div key={dateString} className="relative group">
                    <div className={`w-3.5 h-3.5 rounded-sm ${colorClass}`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    <br/>
                    <span className={isFuture ? 'text-gray-400' : isPresent ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                        {isFuture ? 'Future' : isPresent ? 'Present' : 'Absent'}
                    </span>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
       {/* Legend */}
       <div className="flex justify-end items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-4 pr-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-green-500"></div>
              <span>Present</span>
            </div>
      </div>
    </div>
  );
};

export default AttendanceHeatmap;
