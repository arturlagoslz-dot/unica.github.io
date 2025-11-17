import React, { useState, useContext, useRef } from 'react';
import { Student, Class, User } from '../types';
import { DataContext } from '../App';
import StudentForm from './StudentForm';
import UserForm from './UserForm';
import ClassForm from './ClassForm';

const AdminDashboard: React.FC = () => {
  const data = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<'students' | 'users' | 'classes'>('students');

  // State for forms/modals
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [isClassFormOpen, setIsClassFormOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<Class | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!data) return <div>Carregando...</div>;
  const { 
    students, classes, users,
    handleSaveStudent, handleDeleteStudent,
    handleSaveUser, handleDeleteUser,
    handleSaveClass, handleDeleteClass,
    handleExportData, handleImportData
  } = data;

  // Handlers for Students
  const onSaveStudent = (studentData: Omit<Student, 'id' | 'evaluations'> & { id?: number }) => {
    handleSaveStudent(studentData);
    setIsStudentFormOpen(false);
    setStudentToEdit(null);
  };

  const onEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentFormOpen(true);
  };

  const onDeleteStudent = (student: Student) => {
    handleDeleteStudent(student.id);
  };
  
  // Handlers for Users
  const onSaveUser = (userData: Omit<User, 'id'> & { id?: number }) => {
      handleSaveUser(userData);
      setIsUserFormOpen(false);
      setUserToEdit(null);
  }

  const onEditUser = (user: User) => {
      setUserToEdit(user);
      setIsUserFormOpen(true);
  }

  const onDeleteUser = (user: User) => {
    handleDeleteUser(user.id);
  };

  // Handlers for Classes
  const onSaveClass = (classData: Omit<Class, 'id'> & { id?: number }) => {
      handleSaveClass(classData);
      setIsClassFormOpen(false);
      setClassToEdit(null);
  }

  const onEditClass = (cls: Class) => {
      setClassToEdit(cls);
      setIsClassFormOpen(true);
  }
  
  const onDeleteClass = (cls: Class) => {
    handleDeleteClass(cls.id);
  };

  const handleExportStudentsToCsv = () => {
    const escapeCsvCell = (cell: any): string => {
        if (cell === null || cell === undefined) {
            return '';
        }
        let cellString = cell.toString();
        cellString = cellString.replace(/"/g, '""');
        if (cellString.search(/("|,|\n)/g) >= 0) {
            cellString = `"${cellString}"`;
        }
        return cellString;
    };

    const calculateAge = (dob: string) => {
      if (!dob) return 'N/A';
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
      return `${age} anos e ${months} meses`;
    };

    const headers = [
      'ID do Aluno', 'Nome do Aluno', 'CPF', 'Data de Nascimento', 'Idade', 'Gênero', 'Status', 'Turma', 'Turno', 'Ano de Início', 'Endereço',
      'Nome da Mãe', 'CPF da Mãe', 'Nome do Pai', 'CPF do Pai', 'Responsável Principal', 'Telefone do Responsável',
      'Observações Médicas', 'Restrições Alimentares', 'Necessidades Específicas', 'Histórico Escolar'
    ];

    const rows = students.map(student => {
        const studentClass = classes.find(c => c.id === student.classId)?.name || 'N/A';
        return [
            student.id,
            student.name,
            student.cpf || '',
            student.dob ? new Date(student.dob + 'T00:00:00').toLocaleDateString('pt-BR') : '',
            calculateAge(student.dob),
            student.gender || '',
            student.status === 'active' ? 'Ativo' : 'Inativo',
            studentClass,
            student.shift,
            student.startYear || '',
            student.address || '',
            student.motherInfo?.name || '',
            student.motherInfo?.isAlive ? (student.motherInfo?.cpf || '') : 'Falecida',
            student.fatherInfo?.name || '',
            student.fatherInfo?.isAlive ? (student.fatherInfo?.cpf || '') : 'Falecido',
            student.guardians[0]?.name || '',
            student.guardians[0]?.phone || '',
            student.medicalNotes || '',
            student.foodRestrictions || '',
            student.specialNeeds || '',
            student.schoolHistory || ''
        ].map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sapi_alunos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Gerenciar Alunos</h3>
              <button onClick={() => { setStudentToEdit(null); setIsStudentFormOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Adicionar Aluno</button>
            </div>
            <ul className="space-y-2">
              {students.map(student => (
                <li key={student.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <span>{student.name} - Turma: {classes.find(c=>c.id === student.classId)?.name || 'N/A'}</span>
                  <div className="space-x-4">
                    <button onClick={() => onEditStudent(student)} className="text-blue-600 hover:underline font-semibold">Editar</button>
                    <button onClick={() => onDeleteStudent(student)} className="text-red-600 hover:underline font-semibold">Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'users':
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Gerenciar Usuários</h3>
                    <button onClick={() => { setUserToEdit(null); setIsUserFormOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Adicionar Usuário</button>
                </div>
                <ul className="space-y-2">
                    {users.map(user => (
                        <li key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <span>{user.name} - {user.role}</span>
                         <div className="space-x-4">
                            <button onClick={() => onEditUser(user)} className="text-blue-600 hover:underline font-semibold">Editar</button>
                            <button onClick={() => onDeleteUser(user)} className="text-red-600 hover:underline font-semibold">Excluir</button>
                         </div>
                        </li>
                    ))}
                </ul>
          </div>
        );
      case 'classes':
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Gerenciar Turmas</h3>
                    <button onClick={() => { setClassToEdit(null); setIsClassFormOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Adicionar Turma</button>
                </div>
                <ul className="space-y-2">
                    {classes.map(cls => (
                        <li key={cls.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                        <span>{cls.name} - Prof.: {users.find(u => u.id === cls.teacherId)?.name || 'N/A'}</span>
                         <div className="space-x-4">
                            <button onClick={() => onEditClass(cls)} className="text-blue-600 hover:underline font-semibold">Editar</button>
                            <button onClick={() => onDeleteClass(cls)} className="text-red-600 hover:underline font-semibold">Excluir</button>
                         </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabName: 'students' | 'users' | 'classes', label: string}> = ({tabName, label}) => (
    <button onClick={() => setActiveTab(tabName)} className={`${activeTab === tabName ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
        {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Painel do Administrador</h2>

        <div className="bg-gray-100 border-l-4 border-blue-500 p-6 rounded-r-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Gerenciamento de Dados</h3>
            <p className="text-sm text-gray-600 mb-4">
                Exporte todos os dados do sistema para um arquivo de backup ou uma planilha Excel.
                Você pode usar o arquivo de backup para restaurar os dados posteriormente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                    onClick={handleExportData}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 font-semibold transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Exportar Backup (JSON)</span>
                </button>
                 <button
                    onClick={handleExportStudentsToCsv}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM4 8h5v2H4V8z" clipRule="evenodd" />
                    </svg>
                    <span>Exportar Alunos (Excel)</span>
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Importar Backup (JSON)</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json,application/json"
                    onChange={handleImportData}
                    onClick={(event) => { (event.target as HTMLInputElement).value = ''; }}
                />
            </div>
        </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <TabButton tabName="students" label="Alunos" />
            <TabButton tabName="users" label="Usuários" />
            <TabButton tabName="classes" label="Turmas" />
          </nav>
        </div>
        {renderContent()}
      </div>

      {isStudentFormOpen && <StudentForm studentToEdit={studentToEdit} onSave={onSaveStudent} onCancel={() => setIsStudentFormOpen(false)} classes={classes} />}
      {isUserFormOpen && <UserForm userToEdit={userToEdit} classes={classes} onSave={onSaveUser} onCancel={() => setIsUserFormOpen(false)} />}
      {isClassFormOpen && <ClassForm classToEdit={classToEdit} teachers={users.filter(u => u.role === 'Professor')} onSave={onSaveClass} onCancel={() => setIsClassFormOpen(false)} />}
    </div>
  );
};

export default AdminDashboard;