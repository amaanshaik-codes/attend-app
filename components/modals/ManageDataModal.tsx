'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Student } from '../../types';
import { PlusIcon, TrashIcon, ExportIcon } from '../icons';

interface ManageDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  allStudents: Student[];
  onMutate: (action: any) => Promise<void>;
}

const ManageDataModal: React.FC<ManageDataModalProps> = ({ isOpen, onClose, allStudents, onMutate }) => {
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewStudentName('');
    }
  }, [isOpen]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newStudentName.trim();
    if (trimmedName === '') return;

    const isDuplicate = allStudents.some(
      (student) => student.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      alert(`A student named "${trimmedName}" already exists.`);
      return;
    }

    const newStudent: Student = {
      id: `s_${new Date().getTime()}`,
      name: trimmedName,
      attendanceDates: [],
    };
    
    await onMutate({ type: 'ADD_STUDENT', payload: newStudent });
    setNewStudentName('');
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove all their attendance data.')) {
        await onMutate({ type: 'DELETE_STUDENT', payload: { studentId } });
    }
  }
  
  // Import/Export functionality would need dedicated API routes
  const handleExport = () => {
      const dataStr = JSON.stringify(allStudents, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `attend-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-11/12 max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Data</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Manage Students</h3>
                <form onSubmit={handleAddStudent} className="flex gap-2 mb-4">
                    <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="New student name..." className="flex-grow bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none"/>
                    <button type="submit" className="bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-semibold py-2 px-3 rounded-lg flex-shrink-0"><PlusIcon /></button>
                </form>
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 -mr-2">
                    {allStudents.length > 0 ? allStudents.map(student => (
                        <li key={student.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <span>{student.name}</span>
                            <button onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full flex-shrink-0"><TrashIcon /></button>
                        </li>
                    )) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No students yet.</p>
                    )}
                </ul>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-3">Backup</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200">
                        <ExportIcon /> Export Current Data
                    </button>
                    {/* Import functionality is disabled as it's complex and risky with a live database */}
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 text-right">
            <button onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-6 rounded-lg transition">Done</button>
        </div>
      </div>
    </div>
  );
};

export default ManageDataModal;