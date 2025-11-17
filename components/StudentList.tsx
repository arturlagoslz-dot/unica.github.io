import React from 'react';
import { Student, Class } from '../types';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  classes: Class[];
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: number) => void;
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
  const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
  return `${age} anos e ${months} meses`;
};

const StudentList: React.FC<StudentListProps> = ({ students, onSelectStudent, classes, onEdit, onDelete }) => {
  const getClassName = (classId: number) => classes.find(c => c.id === classId)?.name || 'N/A';
  
  return (
    <div>
        {students.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">Nenhum aluno encontrado para este perfil.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {students.map(student => (
                <div 
                    key={student.id} 
                    className="bg-white rounded-lg shadow-md flex flex-col justify-between hover:shadow-xl transition-shadow duration-200"
                >
                    <div 
                        className="p-5 cursor-pointer flex-grow"
                        onClick={() => onSelectStudent(student)}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center mb-4">
                                <span className="text-4xl text-blue-600 font-bold">{student.name.charAt(0)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                                {student.specialNeeds && (
                                    <span title="Este aluno possui necessidades específicas">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{calculateAge(student.dob)}</p>
                            <p className="text-sm text-gray-600 mt-2 bg-gray-100 px-2 py-1 rounded-full">{getClassName(student.classId)} - {student.shift}</p>
                        </div>
                    </div>
                    {(onEdit || onDelete) && (
                        <div className="border-t border-gray-200 p-2 flex justify-center items-center space-x-2 bg-gray-50">
                            {onEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(student);
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 w-full transition-colors"
                                >
                                    Editar
                                </button>
                            )}
                            {onDelete && (
                                 <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(student.id);
                                    }}
                                    className="text-xs font-semibold text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100 w-full transition-colors"
                                >
                                    Excluir
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
            </div>
        )}
    </div>
  );
};

export default StudentList;