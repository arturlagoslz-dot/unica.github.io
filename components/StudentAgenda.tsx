import React, { useState, useEffect } from 'react';
import { Student, AgendaEntry } from '../types';

interface StudentAgendaProps {
    student: Student;
    onSave: (updatedAgenda: AgendaEntry[]) => void;
    isEditable: boolean;
}

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BLANK_AGENDA_ENTRY: Omit<AgendaEntry, 'date'> = {
    meals: '',
    activities: '',
    observations: '',
    messages: '',
    importantNotice: false,
};

const StudentAgenda: React.FC<StudentAgendaProps> = ({ student, onSave, isEditable }) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [currentEntry, setCurrentEntry] = useState<AgendaEntry>({
        date: selectedDate,
        ...BLANK_AGENDA_ENTRY
    });

    useEffect(() => {
        const entryForDate = student.agenda?.find(entry => entry.date === selectedDate);
        if (entryForDate) {
            setCurrentEntry(entryForDate);
        } else {
            setCurrentEntry({ date: selectedDate, ...BLANK_AGENDA_ENTRY });
        }
    }, [selectedDate, student.agenda]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setCurrentEntry(prev => ({ ...prev, [name]: checked }));
        } else {
            setCurrentEntry(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        const updatedAgenda = [...(student.agenda || [])];
        const entryIndex = updatedAgenda.findIndex(entry => entry.date === selectedDate);

        if (entryIndex > -1) {
            // Update existing entry
            updatedAgenda[entryIndex] = currentEntry;
        } else {
            // Add new entry
            updatedAgenda.push(currentEntry);
        }
        
        // Sort agenda by date just in case
        updatedAgenda.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        onSave(updatedAgenda);
    };

    const AgendaField: React.FC<{ label: string; name: keyof Omit<AgendaEntry, 'date' | 'importantNotice'>; value: string }> = ({ label, name, value }) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
                rows={4}
                readOnly={!isEditable}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <label htmlFor="agenda-date" className="font-semibold text-lg text-gray-700">Agenda do dia:</label>
                <input
                    type="date"
                    id="agenda-date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
                <AgendaField label="Alimentação" name="meals" value={currentEntry.meals} />
                <AgendaField label="Atividades Realizadas" name="activities" value={currentEntry.activities} />
                <AgendaField label="Observações Gerais" name="observations" value={currentEntry.observations} />
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="messages" className="block text-sm font-medium text-gray-700">Recados para os Pais</label>
                        {isEditable && (
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="importantNotice"
                                    name="importantNotice"
                                    checked={!!currentEntry.importantNotice}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
                                />
                                <label htmlFor="importantNotice" className="text-sm text-gray-600">Aviso importante</label>
                            </div>
                        )}
                    </div>
                    {currentEntry.importantNotice && (
                        <div className="flex items-center space-x-2 p-2 mb-2 bg-yellow-100 border border-yellow-300 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-yellow-800">Aviso Importante</span>
                        </div>
                    )}
                    <textarea
                        id="messages"
                        name="messages"
                        value={currentEntry.messages}
                        onChange={handleChange}
                        rows={currentEntry.importantNotice ? 2 : 4}
                        readOnly={!isEditable}
                        className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 ${currentEntry.importantNotice ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-300'}`}
                    />
                </div>
            </div>

            {isEditable && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7.5 2.5a.5.5 0 00-1 0v1.75a.25.25 0 01-.25.25H4.5a.5.5 0 000 1h1.75c.138 0 .25.112.25.25v2a.5.5 0 001 0v-2c0-.138.112-.25.25-.25H9.5a.5.5 0 000-1H7.75a.25.25 0 01-.25-.25V2.5z" />
                            <path fillRule="evenodd" d="M3 4.5A1.5 1.5 0 014.5 3h6.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 01.439 1.062V15.5A1.5 1.5 0 0113.5 17h-9A1.5 1.5 0 013 15.5v-11zM4.5 4a.5.5 0 00-.5.5v11a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V6.621a.5.5 0 00-.146-.354l-2.122-2.12A.5.5 0 0011.379 4H4.5z" clipRule="evenodd" />
                        </svg>
                        <span>Salvar Agenda do Dia</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudentAgenda;