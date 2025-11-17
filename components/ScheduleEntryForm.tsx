import React, { useState, useEffect } from 'react';
import { ScheduleEntry } from '../types';

type DayOfWeek = 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';

interface ScheduleEntryFormProps {
  entryToEdit: ScheduleEntry | null;
  dayOfWeek: DayOfWeek;
  classId: number;
  onSave: (entry: Omit<ScheduleEntry, 'id'> & { id?: number }) => void;
  onDelete: (entryId: number) => void;
  onCancel: () => void;
}

const ScheduleEntryForm: React.FC<ScheduleEntryFormProps> = ({ entryToEdit, dayOfWeek, classId, onSave, onDelete, onCancel }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    subject: '',
  });

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        startTime: entryToEdit.startTime,
        endTime: entryToEdit.endTime,
        subject: entryToEdit.subject,
      });
    } else {
        setFormData({ startTime: '', endTime: '', subject: '' });
    }
  }, [entryToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startTime || !formData.endTime || !formData.subject) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSave({
      id: entryToEdit?.id,
      ...formData,
      dayOfWeek,
      classId,
    });
  };
  
  const isEditing = !!entryToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? 'Editar Horário' : `Adicionar Horário em ${dayOfWeek}`}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Início</label>
              <input type="time" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Fim</label>
              <input type="time" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Atividade / Matéria</label>
            <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div>
             {isEditing && (
                <button type="button" onClick={() => onDelete(entryToEdit!.id)} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Excluir</button>
             )}
            </div>
            <div className="flex space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Salvar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleEntryForm;