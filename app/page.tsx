'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import * as htmlToImage from 'html-to-image';
import { Student, Theme } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from '../components/Header';
import StudentList from '../components/StudentList';
import ReportPanel from '../components/ReportPanel';
import ManageDataModal from '../components/modals/ManageDataModal';
import StudentProfileModal from '../components/modals/StudentProfileModal';
import { PlusIcon, SearchIcon } from '../components/icons';
import SyncStatus from '../components/SyncStatus';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
});

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

export default function HomePage() {
  const { data, error, mutate, isLoading } = useSWR('/api/data', fetcher, {
     revalidateOnFocus: false,
     revalidateOnReconnect: false,
  });
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'system');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const allStudents: Student[] = data?.students ?? [];

  useEffect(() => {
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);
  
  const handleMutation = useCallback(async (action: any) => {
    setIsSaving(true);
    setSyncError(null);
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      await mutate(); // Re-fetch data from server
      setLastSync(new Date());
    } catch (e) {
      setSyncError('Failed to save changes. Please check your connection.');
      console.error(e);
      // Optionally revalidate to revert optimistic update
      mutate();
    } finally {
      setIsSaving(false);
    }
  }, [mutate]);

  const handleToggleStudent = useCallback((studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    const isPresent = student.attendanceDates.includes(selectedDate);
    
    // Optimistic UI update
    const updatedStudents = allStudents.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          attendanceDates: isPresent 
            ? s.attendanceDates.filter(d => d !== selectedDate)
            : [...s.attendanceDates, selectedDate],
        };
      }
      return s;
    });
    mutate({ students: updatedStudents }, false); // Update local cache without revalidating

    handleMutation({
      type: 'TOGGLE_ATTENDANCE',
      payload: { studentId, date: selectedDate, present: !isPresent },
    });
  }, [selectedDate, allStudents, handleMutation, mutate]);

  const handleSelectAll = useCallback((select: boolean) => {
     const studentIdsToUpdate = allStudents
      .map(s => s.id)
    
    handleMutation({
      type: 'UPDATE_BATCH_ATTENDANCE',
      payload: { studentIds: studentIdsToUpdate, date: selectedDate, present: select },
    });
  }, [selectedDate, allStudents, handleMutation]);

  const { presentStudents, absentStudents } = useMemo(() => {
    const present: Student[] = [];
    const absent: Student[] = [];
    allStudents.forEach(s => {
      if (s.attendanceDates.includes(selectedDate)) {
        present.push(s);
      } else {
        absent.push(s);
      }
    });
    return { presentStudents: present, absentStudents: absent };
  }, [allStudents, selectedDate]);
  
  const displayedStudents = useMemo(() => {
    return allStudents
      .filter(student => student.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.attendanceDates.length - a.attendanceDates.length);
  }, [allStudents, searchQuery]);

  const reportRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(reportRef.current, { 
        quality: 1, 
        pixelRatio: 2.5,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#000000' : '#F9FAFB'
      });
      const link = document.createElement('a');
      link.download = `attendance-report-BBA-Business-Analytics-${selectedDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Could not generate image. Please try again.');
    }
  }, [selectedDate]);

  if (error) return <div className="text-red-500 text-center p-8">Failed to load data. Please check your connection and Google Sheet setup.</div>
  if (isLoading) return <div className="text-center p-8">Loading students...</div>

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Header theme={theme} setTheme={setTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex-grow w-full sm:w-auto">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:max-w-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-lg focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none transition"
                />
              </div>
            </div>
            <button
                onClick={() => setManageModalOpen(true)}
                className="bg-primary-light hover:bg-opacity-90 dark:bg-primary-dark dark:hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm whitespace-nowrap"
            >
                Manage Data
            </button>
        </div>

        {allStudents.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-2">No students found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your students.</p>
            <button
                onClick={() => setManageModalOpen(true)}
                className="bg-primary-light hover:bg-opacity-90 dark:bg-primary-dark dark:hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg text-lg inline-flex items-center gap-2"
            >
                <PlusIcon /> Add Your First Student
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <StudentList
                students={displayedStudents}
                presentStudentIds={new Set(presentStudents.map(s => s.id))}
                onToggleStudent={handleToggleStudent}
                onSelectAll={handleSelectAll}
                onViewStudent={setViewingStudent}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
            <div className="lg:col-span-2">
              <ReportPanel
                ref={reportRef}
                presentStudents={presentStudents}
                absentStudents={absentStudents}
                totalStudents={allStudents.length}
                onGenerateImage={generateImage}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-gray-50 dark:bg-black">
        <SyncStatus isSaving={isSaving} lastSync={lastSync} error={syncError} />
        <div className='mt-1'>Crafted 😠by Amaan</div>
      </footer>

      <ManageDataModal
        isOpen={isManageModalOpen}
        onClose={() => setManageModalOpen(false)}
        allStudents={allStudents}
        onMutate={handleMutation}
      />

      {viewingStudent && (
        <StudentProfileModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  );
}
