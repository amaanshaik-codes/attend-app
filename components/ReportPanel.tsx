import React, { useState, useCallback, useMemo, forwardRef } from 'react';
import { Student } from '../types';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface ReportPanelProps {
  presentStudents: Student[];
  absentStudents: Student[];
  totalStudents: number;
  onGenerateImage: () => void;
  selectedDate: string;
}

const ReportPanel = forwardRef<HTMLDivElement, ReportPanelProps>(
  ({ presentStudents, absentStudents, totalStudents, onGenerateImage, selectedDate }, ref) => {
  const [isCopied, setIsCopied] = useState(false);
  const className = "BBA Business Analytics"; // Static class name

  const formattedDate = useMemo(() => {
    const date = new Date(selectedDate);
    // Adjust for timezone offset to get the correct local date
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);

    const day = String(localDate.getDate()).padStart(2, '0');
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const year = localDate.getFullYear();
    return `${day}.${month}.${year}`;
  }, [selectedDate]);

  const reportText = useMemo(() => {
    if (totalStudents === 0) return '';
    
    const presentNames = presentStudents.length > 0 ? presentStudents.map(s => s.name).join('\n') : 'None';
    const absentNames = absentStudents.length > 0 ? absentStudents.map(s => s.name).join('\n') : 'None';

    return `*Attendance Report: ${className}*
*Date: ${formattedDate}*

*Summary:*
Present: ${presentStudents.length}/${totalStudents}
Absent: ${absentStudents.length}/${totalStudents}

---

*Present Students:*
${presentNames}

---

*Absent Students:*
${absentNames}
`;
  }, [presentStudents, absentStudents, totalStudents, className, formattedDate]);

  const handleCopy = useCallback(() => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [reportText]);
  
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents.length / totalStudents) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sm:p-6 sticky top-24">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">Attendance Report</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Image Preview</h3>
          <div ref={ref} className="bg-gray-50 dark:bg-black p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 text-sm shadow-inner-sm dark:shadow-inner-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="font-bold text-green-600 dark:text-green-500 text-lg">{formattedDate}</p>
                    {className && <p className="text-gray-600 dark:text-gray-300 mt-1 font-semibold text-base">{className}</p>}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{`${presentStudents.length}/${totalStudents}`}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">PRESENT ({attendancePercentage}%)</p>
                </div>
              </div>
              <div className="space-y-3">
                  <div>
                      <h4 className="font-semibold text-green-700 dark:text-green-500 mb-1 text-xs uppercase tracking-wider">Present ({presentStudents.length})</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                          {presentStudents.length > 0 ? presentStudents.map(s => s.name).join(', ') : <span className="italic text-gray-500">None</span>}
                      </p>
                  </div>
                   <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-500 mb-1 text-xs uppercase tracking-wider">Absent ({absentStudents.length})</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                          {absentStudents.length > 0 ? absentStudents.map(s => s.name).join(', ') : <span className="italic text-gray-500">None</span>}
                      </p>
                  </div>
              </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
            <button
            onClick={handleCopy}
            disabled={!reportText}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isCopied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy Text</>}
            </button>
            <button
            onClick={onGenerateImage}
            disabled={totalStudents === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary-light hover:bg-opacity-90 dark:bg-primary-dark dark:hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <DownloadIcon /> Download Image
            </button>
        </div>
      </div>
    </div>
  );
});

export default ReportPanel;