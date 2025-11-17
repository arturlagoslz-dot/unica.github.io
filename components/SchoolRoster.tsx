import React, { useState, useMemo } from 'react';
import { Student, Class, User } from '../types';

interface SchoolRosterProps {
  allStudents: Student[];
  classes: Class[];
  users: User[];
  teacher: User;
  onEnrollStudent: (student: Student) => void;
}

const calculateAge = (dob: string) => {
  if (!dob) return 'Idade não informada';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} anos`;
};

const SchoolRoster: React.FC<SchoolRosterProps> = ({ allStudents, classes, users, teacher, onEnrollStudent }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'all'>('available');
  const [searchQuery, setSearchQuery] = useState('');

  const getClassName = (classId: number) => classes.find(c => c.id === classId)?.name || 'Sem turma';
  const getTeacherName = (classId: number) => {
      const classInfo = classes.find(c => c.id === classId);
      if (!classInfo) return 'N/A';
      return users.find(u => u.id === classInfo.teacherId)?.name || 'N/A';
  };

  const filteredStudents = useMemo(() => {
    let studentsToDisplay = allStudents;

    if (activeTab === 'available') {
        studentsToDisplay = allStudents.filter(s => s.status === 'inactive');
    }
    
    if (searchQuery) {
        return studentsToDisplay.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return studentsToDisplay;
  }, [allStudents, activeTab, searchQuery]);

  const TabButton: React.FC<{tabName: 'available' | 'all', label: string}> = ({tabName, label}) => (
    <button onClick={() => setActiveTab(tabName)} className={`${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} px-5 py-2.5 font-semibold text-sm rounded-lg shadow-sm transition-colors`}>
        {label}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Matricular Alunos</h2>
            <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
                <TabButton tabName="available" label="Disponíveis para Matrícula" />
                <TabButton tabName="all" label="Listagem Geral" />
            </div>
        </div>

        <div className="mb-6">
            <input
                type="text"
                placeholder="Pesquisar aluno pelo nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>

        {filteredStudents.length === 0 ? (
             <div className="text-center py-10">
                <p className="text-gray-500">Nenhum aluno encontrado.</p>
            </div>
        ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {filteredStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div>
                            <p className="font-bold text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-600">{calculateAge(student.dob)}</p>
                            {activeTab === 'all' && (
                                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                    student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {student.status === 'active' ? `Matriculado(a) em ${getClassName(student.classId)} (Prof. ${getTeacherName(student.classId)})` : 'Aguardando Matrícula'}
                                </p>
                            )}
                        </div>
                        {student.status === 'inactive' && (
                            <button
                                onClick={() => onEnrollStudent(student)}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm font-semibold transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span>Matricular na minha turma</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default SchoolRoster;