'use client';
import React, { useMemo } from 'react';
import { Student } from '../../types';
import AttendanceHeatmap from '../AttendanceHeatmap';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
}

function calculateCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const dateSet = new Set(dates);
  const today = new Date();
  
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // A streak is only "current" if it includes today or yesterday.
  if (!dateSet.has(today.toISOString().slice(0, 10)) && !dateSet.has(yesterday.toISOString().slice(0, 10))) {
    return 0;
  }
  
  let streak = 0;
  let currentDate = new Date();
  
  // If today is not attended, start checking from yesterday.
  if (!dateSet.has(today.toISOString().slice(0, 10))) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  while (dateSet.has(currentDate.toISOString().slice(0, 10))) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}


const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
  const totalDays = student.attendanceDates.length;
  const currentStreak = useMemo(() => calculateCurrentStreak(student.attendanceDates), [student.attendanceDates]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-11/12 lg:w-full lg:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl sm:text-2xl font-bold">{student.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Profile</p>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-primary-light dark:text-primary-dark">{totalDays}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Days Attended</p>
                </div>
                 <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-primary-light dark:text-primary-dark">{currentStreak}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4">Last 6 Months Activity</h3>
                <AttendanceHeatmap attendanceDates={student.attendanceDates} />
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-right">
            <button onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-6 rounded-lg transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
