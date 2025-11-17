import React, { useState, useEffect } from 'react';
import { User, Role, Class } from '../types';

interface UserFormProps {
  userToEdit: User | null;
  classes: Class[];
  onSave: (user: Omit<User, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, classes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    email: '',
    password: '',
    role: 'Professor' as string,
    classId: undefined as number | undefined,
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        login: userToEdit.login,
        email: userToEdit.email || '',
        password: '', // Never pre-fill password for security
        role: userToEdit.role,
        classId: userToEdit.classId,
      });
    } else {
        setFormData({
            name: '',
            login: '',
            email: '',
            password: '',
            role: 'Professor',
            classId: classes[0]?.id,
        });
    }
  }, [userToEdit, classes]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
        const newState = {
            ...prev,
            [name]: name === 'classId' ? (value ? parseInt(value) : undefined) : value
        };

        if (name === 'role' && value !== 'Professor') {
            newState.email = '';
            newState.classId = undefined;
        }

        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.login || !formData.role) {
        alert('Por favor, preencha os campos de Nome, Login e Perfil.');
        return;
    }
    if (!userToEdit && !formData.password) {
        alert('O campo Senha é obrigatório para novos usuários.');
        return;
    }
    if (formData.role === 'Professor' && !formData.email) {
        alert('O campo E-mail é obrigatório para professores.');
        return;
    }
    if(formData.role === 'Professor' && !formData.classId) {
        alert('Por favor, selecione uma turma para o professor.');
        return;
    }

    const userData: { [key: string]: any } = {
      id: userToEdit?.id,
      name: formData.name,
      login: formData.login,
      email: formData.role === 'Professor' ? formData.email : undefined,
      role: formData.role,
      classId: formData.role === 'Professor' ? formData.classId : undefined,
    };

    if (formData.password) {
      userData.password = formData.password;
    }
    
    onSave(userData as Omit<User, 'id'> & { id?: number });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{userToEdit ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700">Login</label>
            <input type="text" name="login" id="login" value={formData.login} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          {formData.role === 'Professor' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required={formData.role === 'Professor'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
              </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder={userToEdit ? 'Deixe em branco para manter a atual' : ''} required={!userToEdit} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Cargo</label>
                 <input
                  list="role-suggestions"
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <datalist id="role-suggestions">
                    {Object.values(Role).filter(r => r !== 'Responsável').map(r => <option key={r} value={r} />)}
                </datalist>
              </div>

              {formData.role === 'Professor' && (
                 <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Turma</label>
                    <select name="classId" id="classId" value={formData.classId || ''} onChange={handleChange} required={formData.role === 'Professor'} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Selecione uma turma</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
              )}
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

export default UserForm;