import React, { useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AuthContext, DataContext } from '../App';
import { Student } from '../types';
import StudentList from './StudentList';
import StudentProfile from './StudentProfile';
import CoordinatorDashboard from './CoordinatorDashboard';
import AdminDashboard from './AdminDashboard';
import DirectorDashboard from './DirectorDashboard';
import StudentForm from './StudentForm';
import WeeklySchedule from './WeeklySchedule';
import SchoolRoster from './SchoolRoster';
import AttendanceSheet from './AttendanceSheet';

// Adiciona as declarações para as bibliotecas globais (jspdf, html2canvas)
declare global {
    interface Window {
        html2canvas: (element: HTMLElement, options?: Partial<any>) => Promise<HTMLCanvasElement>;
        jspdf: {
            jsPDF: new (options?: any) => any;
        };
    }
}

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const data = useContext(DataContext);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // State for forms/modals, now used by Professor role as well
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const schedulePdfRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherView, setTeacherView] = useState<'myClass' | 'schoolRoster' | 'attendance'>('myClass');


  if (!auth || !auth.user || !data) {
    return null; // Should not happen if App component logic is correct
  }
  
  const { user, logout } = auth;
  const { students, classes, users, notices, handleSaveStudent, handleDeleteStudent, handleMarkNoticeAsRead } = data;

  useEffect(() => {
    if (selectedStudent) {
      // Find the latest version of the selected student from the global state
      const updatedStudent = students.find(s => s.id === selectedStudent.id);
      if (updatedStudent) {
        // If the student still exists and might have been updated, sync the local state
        setSelectedStudent(updatedStudent);
      } else {
        // The student was deleted, so go back to the list
        setSelectedStudent(null);
      }
    }
  }, [students, selectedStudent]); // This effect runs whenever the main students list changes.

  const unreadNotices = useMemo(() => {
    if (user.role !== 'Professor' || !notices) return [];
    return notices.filter(n => 
        (n.recipientId === 'all' || n.recipientId === user.id) &&
        !n.readBy.includes(user.id)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // show newest first
  }, [notices, user]);

  const getSenderName = (senderId: number): string => {
      return users.find(u => u.id === senderId)?.name || 'Coordenação';
  }

  // --- Student Management Handlers (for Professor) ---
  const onSaveStudent = (studentData: Omit<Student, 'id' | 'evaluations'> & { id?: number }) => {
    handleSaveStudent(studentData);
    setIsStudentFormOpen(false);
    setStudentToEdit(null);
  };

  const onEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsStudentFormOpen(true);
  };

  const onDeleteStudent = (studentId: number) => {
    handleDeleteStudent(studentId);
  };
  
  const onAddNewStudent = () => {
    setStudentToEdit(null);
    setIsStudentFormOpen(true);
  }

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };
  
    const handleGenerateSchedulePdf = async () => {
        if (!schedulePdfRef.current || !user.classId) return;
        setIsGeneratingPdf(true);
        try {
            const selectedClass = classes.find(c => c.id === user.classId);
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(schedulePdfRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));
            pdf.save(`Horario_Turma_${selectedClass?.name.replace(/\s/g, '_') || 'Turma'}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleEnrollStudent = (studentToEnroll: Student) => {
        if (!user.classId) {
            alert("Você não está associado a uma turma para matricular alunos.");
            return;
        }
        
        handleSaveStudent({
            ...studentToEnroll,
            classId: user.classId,
            status: 'active',
        });
        alert(`${studentToEnroll.name} matriculado(a) com sucesso!`);
        setTeacherView('myClass');
    };

  const getStudentsForUser = (): Student[] => {
    switch (user.role) {
      case 'Admin Master':
      case 'Diretor':
      case 'Coordenador':
        return students;
      case 'Professor':
        return students.filter(s => s.classId === user.classId && s.status === 'active');
      case 'Psicopedagogo':
        // For simplicity, showing students with psycho notes. In a real app, this would be a specific list.
        return students.filter(s => s.evaluations.some(e => e.psychoNotes));
      default:
        return [];
    }
  };

  const currentStudents = getStudentsForUser();
  
  const filteredStudents = useMemo(() => {
    if (!searchQuery) {
        return currentStudents;
    }
    return currentStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentStudents, searchQuery]);


  const renderContent = () => {
    if (user.role === 'Responsável') {
        const student = students.find(s => s.id === user.studentId);
        if (!student) {
            return (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold text-red-600">Erro</h2>
                    <p className="text-gray-600 mt-2">Não foi possível encontrar os dados do aluno. Por favor, entre em contato com a escola.</p>
                </div>
            );
        }
        // Render student profile directly for parents, in read-only mode
        return <StudentProfile student={student} onBack={() => {}} userRole={user.role} onSave={() => {}} />;
    }
      
    if (user.role === 'Admin Master') {
        return <AdminDashboard />;
    }

    if (user.role === 'Diretor') {
        return <DirectorDashboard />;
    }
    
    if (user.role === 'Coordenador' && !selectedStudent) {
        return <CoordinatorDashboard students={students} classes={classes} teachers={users.filter(u=>u.role === 'Professor')} onSelectStudent={handleSelectStudent}/>;
    }
    
    if (selectedStudent) {
      return <StudentProfile student={selectedStudent} onBack={handleBackToList} userRole={user.role} onSave={handleSaveStudent as (student: Student) => void} />;
    }

    if(user.role === 'Professor') {
        return (
            <div className="space-y-6">
                 <div className="flex space-x-2 border-b border-gray-200 pb-2 mb-2">
                     <button
                        onClick={() => setTeacherView('myClass')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${teacherView === 'myClass' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                     >
                        Minha Turma
                     </button>
                      <button
                        onClick={() => setTeacherView('attendance')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${teacherView === 'attendance' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                     >
                        Chamada
                     </button>
                     <button
                        onClick={() => setTeacherView('schoolRoster')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${teacherView === 'schoolRoster' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                     >
                        Matricular Alunos
                     </button>
                </div>

                {teacherView === 'myClass' ? (
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-700">Alunos da Turma</h2>
                                <button
                                    onClick={onAddNewStudent}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Adicionar Aluno</span>
                                </button>
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
                            <StudentList 
                                students={filteredStudents} 
                                onSelectStudent={handleSelectStudent} 
                                classes={classes}
                                onEdit={onEditStudent}
                                onDelete={onDeleteStudent}
                            />
                        </div>
                        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-gray-700">Meu Horário Semanal</h2>
                                <button
                                    onClick={handleGenerateSchedulePdf}
                                    disabled={isGeneratingPdf || !user.classId}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center space-x-2 transition-colors disabled:bg-green-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clipRule="evenodd" /></svg>
                                    <span>{isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}</span>
                                </button>
                            </div>
                             {user.classId ? (
                                <WeeklySchedule
                                    ref={schedulePdfRef}
                                    selectedClassId={user.classId}
                                    classes={classes}
                                    teachers={users}
                                    isEditable={false}
                                />
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    Você não está associado a nenhuma turma para visualizar um horário.
                                </p>
                            )}
                        </div>
                    </div>
                ) : teacherView === 'attendance' ? (
                     user.classId ? (
                        <AttendanceSheet
                            studentsInClass={currentStudents}
                            classId={user.classId}
                        />
                    ) : (
                         <p className="text-center text-gray-500 py-8">
                            Você não está associado a nenhuma turma para fazer a chamada.
                        </p>
                    )
                ) : (
                     <SchoolRoster
                        allStudents={students}
                        classes={classes}
                        users={users}
                        teacher={user}
                        onEnrollStudent={handleEnrollStudent}
                    />
                )}
            </div>
        );
    }

    // Default list for other roles like Psicopedagogo
    return <StudentList students={currentStudents} onSelectStudent={handleSelectStudent} classes={classes} />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-blue-600">SAPI</span> - Sistema de Acompanhamento Pedagógico Infantil
          </h1>
          <div className="flex items-center space-x-4">
             {user.role === 'Professor' && (
                 <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 relative focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotices.length > 0 && (
                        <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" title={`${unreadNotices.length} avisos não lidos`}></span>
                    )}
                </button>
            )}
            <div className="text-right">
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-500">{user.role}</p>
            </div>
            <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {unreadNotices.length > 0 && (
            <div className="mb-6 space-y-4">
                {unreadNotices.map(notice => (
                    <div key={notice.id} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg shadow" role="alert">
                        <div className="flex">
                            <div className="py-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mr-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">Aviso da Coordenação ({getSenderName(notice.senderId)})</p>
                                <p className="text-sm whitespace-pre-wrap mt-1">{notice.content}</p>
                                <p className="text-xs text-yellow-700 mt-2">{new Date(notice.timestamp).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="ml-4 self-center">
                                <button
                                    onClick={() => handleMarkNoticeAsRead(notice.id)}
                                    className="px-3 py-1.5 bg-yellow-200 text-yellow-900 text-xs font-bold rounded-md hover:bg-yellow-300 transition-colors"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        {renderContent()}
        {isStudentFormOpen && (
            <StudentForm
                studentToEdit={studentToEdit}
                onSave={onSaveStudent}
                onCancel={() => {
                    setIsStudentFormOpen(false);
                    setStudentToEdit(null);
                }}
                classes={classes}
                defaultClassId={user.role === 'Professor' ? user.classId : undefined}
            />
        )}
      </main>
    </div>
  );
};

export default Dashboard;