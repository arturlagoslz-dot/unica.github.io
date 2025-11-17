import React, { useState, useMemo, useContext, forwardRef } from 'react';
import { ScheduleEntry, Class, User } from '../types';
import { DataContext } from '../App';
import ScheduleEntryForm from './ScheduleEntryForm';

type DayOfWeek = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';

interface WeeklyScheduleProps {
  selectedClassId: number;
  classes: Class[];
  teachers: User[];
  isEditable?: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

const WeeklySchedule = forwardRef<HTMLDivElement, WeeklyScheduleProps>(({ selectedClassId, classes, teachers, isEditable = true }, ref) => {
  const data = useContext(DataContext);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<ScheduleEntry | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const { schedule, handleSaveScheduleEntry, handleDeleteScheduleEntry } = data!;

  const filteredSchedule = useMemo(() => {
    return schedule.filter(entry => entry.classId === selectedClassId);
  }, [schedule, selectedClassId]);

  const scheduleByDay = useMemo(() => {
    const grouped: { [key in DayOfWeek]?: ScheduleEntry[] } = {};
    for (const day of DAYS_OF_WEEK) {
      grouped[day] = filteredSchedule
        .filter(entry => entry.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return grouped;
  }, [filteredSchedule]);

  const handleAddClick = (day: DayOfWeek) => {
    setSelectedDay(day);
    setEntryToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (entry: ScheduleEntry) => {
    setSelectedDay(entry.dayOfWeek);
    setEntryToEdit(entry);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEntryToEdit(null);
    setSelectedDay(null);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const teacher = teachers.find(t => t.id === selectedClass?.teacherId);

  return (
    <>
      <div ref={ref} className="bg-white p-4 rounded-md border">
        {/* Header for PDF */}
        <div className="flex items-center justify-center mb-4 text-center">
          <div>
              <h4 className="text-lg font-bold">Horário Semanal</h4>
              <p className="text-md font-semibold">Turma: {selectedClass?.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">Professor(a): {teacher?.name || 'N/A'}</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-bold text-center text-gray-700 mb-3 border-b pb-2">{day}</h4>
              <div className="space-y-2 min-h-[200px]">
                {scheduleByDay[day]?.map(entry => (
                  <div 
                    key={entry.id} 
                    onClick={isEditable ? () => handleEditClick(entry) : undefined}
                    className={`bg-blue-100 text-blue-800 p-2 rounded-md transition-colors ${isEditable ? 'cursor-pointer hover:bg-blue-200' : 'cursor-default'}`}
                  >
                    <p className="font-semibold text-xs">{entry.startTime} - {entry.endTime}</p>
                    <p className="text-sm">{entry.subject}</p>
                  </div>
                ))}
              </div>
              {isEditable && (
                  <button
                    onClick={() => handleAddClick(day)}
                    className="mt-3 w-full text-sm text-center py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    + Adicionar Horário
                  </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {isFormOpen && selectedDay && isEditable && (
        <ScheduleEntryForm
            entryToEdit={entryToEdit}
            dayOfWeek={selectedDay}
            classId={selectedClassId}
            onSave={(entryData) => {
                handleSaveScheduleEntry(entryData);
                handleCloseForm();
            }}
            onDelete={(entryId) => {
                handleDeleteScheduleEntry(entryId);
                handleCloseForm();
            }}
            onCancel={handleCloseForm}
        />
      )}
    </>
  );
});

export default WeeklySchedule;