import React, { useState, useEffect, useContext } from 'react';
import { Student, AttendanceStatus } from '../types';
import { DataContext } from '../App';

interface AttendanceSheetProps {
    studentsInClass: Student[];
    classId: number;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ studentsInClass, classId }) => {
    const data = useContext(DataContext);
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [attendanceData, setAttendanceData] = useState<Map<number, { status: AttendanceStatus; notes?: string }>>(new Map());

    useEffect(() => {
        const newAttendanceMap = new Map<number, { status: AttendanceStatus; notes?: string }>();
        const recordsForDate = data?.attendance.filter(a => a.date === selectedDate) || [];
        
        studentsInClass.forEach(student => {
            const studentRecord = recordsForDate.find(a => a.studentId === student.id);
            newAttendanceMap.set(student.id, {
                status: studentRecord?.status || AttendanceStatus.Presente,
                notes: studentRecord?.notes || '',
            });
        });
        setAttendanceData(newAttendanceMap);
    }, [selectedDate, studentsInClass, data?.attendance]);

    if (!data) return null;
    const { handleSaveAttendance } = data;

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceData(prev => {
            const newMap = new Map(prev);
            const currentData = newMap.get(studentId) || { status: AttendanceStatus.Presente };
            newMap.set(studentId, { ...currentData, status });
            return newMap;
        });
    };
    
    const handleSave = () => {
        handleSaveAttendance(classId, selectedDate, attendanceData);
        alert(`Chamada para o dia ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')} salva com sucesso!`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-semibold text-gray-800">Folha de Chamada</h3>
                <div className="flex items-center space-x-4">
                    <label htmlFor="attendance-date" className="font-medium text-gray-700">Data:</label>
                    <input
                        type="date"
                        id="attendance-date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {studentsInClass.map(student => {
                    const studentAttendance = attendanceData.get(student.id);
                    return (
                        <div key={student.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                            <span className="font-medium text-gray-800">{student.name}</span>
                            <div className="flex items-center space-x-2">
                                {(Object.values(AttendanceStatus) as AttendanceStatus[]).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(student.id, status)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                            studentAttendance?.status === status
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

             <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                    Salvar Chamada
                </button>
            </div>
        </div>
    );
};

export default AttendanceSheet;
