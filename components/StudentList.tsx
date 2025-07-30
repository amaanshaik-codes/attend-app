'use client';
import React from 'react';
import { Student } from '../types';
import { UserIcon } from './icons';

interface StudentListProps {
  students: Student[];
  presentStudentIds: Set<string>;
  onToggleStudent: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onViewStudent: (student: Student) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, presentStudentIds, onToggleStudent, onSelectAll, onViewStudent, selectedDate, setSelectedDate }) => {
  const allSelectedOnPage = students.length > 0 && students.every(s => presentStudentIds.has(s.id));
  const noneSelectedOnPage = students.length > 0 && students.every(s => !presentStudentIds.has(s.id));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Student List</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sorted by most days attended</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none"
          />
          <div className="flex items-center space-x-2">
              <button
              onClick={() => onSelectAll(true)}
              disabled={allSelectedOnPage}
              className="text-sm font-semibold text-primary-light dark:text-primary-dark disabled:text-gray-400 dark:disabled:text-gray-600 hover:underline transition"
              >
              Select All
              </button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <button
              onClick={() => onSelectAll(false)}
              disabled={noneSelectedOnPage}
              className="text-sm font-semibold text-primary-light dark:text-primary-dark disabled:text-gray-400 dark:disabled:text-gray-600 hover:underline transition"
              >
              Deselect All
              </button>
          </div>
        </div>
      </div>
      
      {students.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-grow pr-2 -mr-2">
          {students.map((student) => {
            const isPresent = presentStudentIds.has(student.id);
            return (
                <div
                key={student.id}
                className={`flex items-center pl-3 pr-4 py-2 rounded-lg transition-all duration-200 ${
                    isPresent 
                    ? 'bg-blue-50 dark:bg-blue-900/40 border-l-4 border-primary-light dark:border-primary-dark' 
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                >
                <input
                    type="checkbox"
                    checked={isPresent}
                    onChange={() => onToggleStudent(student.id)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-primary-light dark:text-primary-dark focus:ring-primary-light dark:focus:ring-primary-dark bg-transparent"
                    aria-label={`Mark ${student.name} as present`}
                />
                <div className="ml-4 flex-grow cursor-pointer" onClick={() => onViewStudent(student)}>
                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 font-medium">{student.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{student.attendanceDates.length} days attended</p>
                </div>
            </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-500"/>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Students Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search or add students via the "Manage Data" button.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentList;
