import React, { useState, useEffect } from 'react';
import { Class, User } from '../types';

interface ClassFormProps {
  classToEdit: Class | null;
  teachers: User[];
  onSave: (cls: Omit<Class, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ classToEdit, teachers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    teacherId: 0,
  });

  const availableTeachers = teachers.filter(t => t.role === 'Professor');

  useEffect(() => {
    if (classToEdit) {
      setFormData({
        name: classToEdit.name,
        teacherId: classToEdit.teacherId,
      });
    } else {
        setFormData({
            name: '',
            teacherId: availableTeachers[0]?.id || 0,
        });
    }
  }, [classToEdit, teachers]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'teacherId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.teacherId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    onSave({
        id: classToEdit?.id,
        ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{classToEdit ? 'Editar Turma' : 'Cadastrar Nova Turma'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Turma</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Professor(a)</label>
            <select name="teacherId" id="teacherId" value={formData.teacherId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value={0} disabled>Selecione um(a) professor(a)</option>
              {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;