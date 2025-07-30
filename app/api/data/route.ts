import { NextResponse } from 'next/server';
import { readSheetData, overwriteSheetData } from '../../../lib/google-sheets';
import { Student } from '../../../types';

export const dynamic = 'force-dynamic'; // force dynamic behavior

// GET all data
export async function GET() {
    try {
        const students = await readSheetData();
        return NextResponse.json({ students });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Failed to fetch data', error: errorMessage }, { status: 500 });
    }
}

// POST to update data
export async function POST(request: Request) {
    try {
        const action = await request.json();
        const currentData: Student[] = await readSheetData();

        let updatedStudents: Student[] = [...currentData];
        
        switch(action.type) {
            case 'ADD_STUDENT':
                const newStudent: Student = action.payload;
                if (!updatedStudents.some(s => s.name.toLowerCase() === newStudent.name.toLowerCase())) {
                    updatedStudents.push(newStudent);
                }
                break;
            case 'DELETE_STUDENT':
                updatedStudents = updatedStudents.filter(s => s.id !== action.payload.studentId);
                break;
            case 'TOGGLE_ATTENDANCE':
                const { studentId, date, present } = action.payload;
                updatedStudents = updatedStudents.map(s => {
                    if (s.id === studentId) {
                        const newDates = present
                            ? [...s.attendanceDates, date]
                            : s.attendanceDates.filter(d => d !== date);
                        return { ...s, attendanceDates: Array.from(new Set(newDates)) };
                    }
                    return s;
                });
                break;
            case 'UPDATE_BATCH_ATTENDANCE':
                const { studentIds, date: batchDate, present: batchPresent } = action.payload;
                const studentIdSet = new Set(studentIds);
                updatedStudents = updatedStudents.map(s => {
                    if (studentIdSet.has(s.id)) {
                         const newDates = batchPresent
                            ? [...s.attendanceDates, batchDate]
                            : s.attendanceDates.filter(d => d !== batchDate);
                        return { ...s, attendanceDates: Array.from(new Set(newDates)) };
                    }
                    return s;
                })
                break;
        }

        const studentsForSheet = updatedStudents.map(({ id, name }) => ({ id, name }));
        const attendanceForSheet = updatedStudents.flatMap(s => 
            s.attendanceDates.map(date => ({ studentId: s.id, date }))
        );
        
        await overwriteSheetData({ students: studentsForSheet, attendance: attendanceForSheet });

        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ message: 'Failed to update data', error: errorMessage }, { status: 500 });
    }
}