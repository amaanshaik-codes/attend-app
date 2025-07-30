import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Student } from '../types';

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const sheetId = process.env.GOOGLE_SHEET_ID;

const getAuth = () => {
    return new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

const getSheets = () => {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
}

export async function readSheetData(): Promise<Student[]> {
    const sheets = getSheets();
    try {
        const studentResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Students!A2:B',
        });
        const attendanceResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Attendance!A2:B',
        });

        const studentRows = studentResponse.data.values || [];
        const attendanceRows = attendanceResponse.data.values || [];
        
        const students: Student[] = studentRows.map(row => ({
            id: row[0],
            name: row[1],
            attendanceDates: [],
        }));
        
        const studentMap = new Map<string, Student>(students.map(s => [s.id, s]));

        attendanceRows.forEach(row => {
            const studentId = row[0];
            const date = row[1];
            if(studentMap.has(studentId)) {
                studentMap.get(studentId)?.attendanceDates.push(date);
            }
        });

        return Array.from(studentMap.values());
    } catch (error) {
        console.error('Failed to read from Google Sheet:', error);
        throw new Error('Could not access Google Sheet. Please check permissions and configuration.');
    }
}

export async function writeToSheet(actions: any[]) {
    const sheets = getSheets();
    const requests = [];

    for (const action of actions) {
        switch (action.type) {
            case 'ADD_STUDENT': {
                const { id, name } = action.payload;
                requests.push({
                    appendCells: {
                        sheetId: 0, // Assuming Students is the first sheet
                        rows: [{ values: [{ userEnteredValue: { stringValue: id } }, { userEnteredValue: { stringValue: name } }] }],
                        fields: 'userEnteredValue'
                    }
                });
                break;
            }
            case 'DELETE_STUDENT': {
                // This is more complex, requires finding the row index first
                // A simpler approach for now might be to clear and rewrite, but let's try finding it.
                // For a robust app, a separate function would be better.
                console.warn("DELETE_STUDENT needs a more robust implementation to find the row index.");
                break;
            }
            case 'TOGGLE_ATTENDANCE': {
                const { studentId, date, present } = action.payload;
                if (present) {
                     requests.push({
                        appendCells: {
                            sheetId: 1, // Assuming Attendance is the second sheet
                            rows: [{ values: [{ userEnteredValue: { stringValue: studentId } }, { userEnteredValue: { stringValue: date } }] }],
                            fields: 'userEnteredValue'
                        }
                    });
                } else {
                    // Deleting rows is complex as it requires finding the row index first.
                    // A better strategy for a sheet "database" is often not to delete but mark as inactive,
                    // or to rebuild the sheet periodically.
                     console.warn("Deleting attendance records is not implemented yet due to complexity.");
                }
                break;
            }
        }
    }

    if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: requests
            }
        });
    }
}


// A more robust implementation would involve clearing and rewriting data,
// which is safer for this kind of "database" usage.

export async function overwriteSheetData(allData: { students: {id: string, name: string}[], attendance: {studentId: string, date: string}[] }) {
    const sheets = getSheets();

    // Clear existing data
    await sheets.spreadsheets.values.batchClear({
        spreadsheetId: sheetId,
        requestBody: {
            ranges: ['Students!A2:B', 'Attendance!A2:B']
        }
    });

    // Write new data
    if (allData.students.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Students!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: allData.students.map(s => [s.id, s.name])
            }
        });
    }
    
    if (allData.attendance.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Attendance!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: allData.attendance.map(a => [a.studentId, a.date])
            }
        });
    }
}