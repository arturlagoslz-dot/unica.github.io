import React, { useState, useRef, useEffect, useContext } from 'react';
import { Student, Role, EvaluationPeriod, AgendaEntry, ParentInfo, AttendanceStatus } from '../types';
import { Root } from 'react-dom/client';
import DevelopmentSheet from './DevelopmentSheet';
import ReportTemplate from './ReportTemplate';
import StudentAgenda from './StudentAgenda';
import { createDefaultEvaluation } from '../data/mockData';
import PeriodForm from './PeriodForm'; // Import the new modal form
import { DataContext } from '../App';
import StudentFileTemplate from './StudentFileTemplate';
import WeeklySchedule from './WeeklySchedule';


// Adiciona as declarações para as bibliotecas globais (jspdf, html2canvas)
declare global {
    interface Window {
        html2canvas: (element: HTMLElement, options?: Partial<any>) => Promise<HTMLCanvasElement>;
        jspdf: {
            jsPDF: new (options?: any) => any;
        };
    }
}

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  userRole: string;
  onSave: (student: Student) => void;
}

const calculateAge = (dob: string) => {
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

interface NewPeriodDetails {
  periodName: string;
  startDate?: string;
  endDate?: string;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, userRole, onSave }) => {
    const data = useContext(DataContext);
    const [activeTab, setActiveTab] = useState('development');
    const [evaluationPeriod, setEvaluationPeriod] = useState<EvaluationPeriod>(student.evaluations[student.evaluations.length - 1] || student.evaluations[0]);
    
    const [isGeneratingReportPdf, setIsGeneratingReportPdf] = useState(false);
    const [isGeneratingFilePdf, setIsGeneratingFilePdf] = useState(false);
    const [isPeriodFormOpen, setIsPeriodFormOpen] = useState(false);
    const [periodToEdit, setPeriodToEdit] = useState<EvaluationPeriod | null>(null);
    const reportComponentRef = useRef<HTMLDivElement>(null);
    const studentFileRef = useRef<HTMLDivElement>(null);
    
    const isParentView = userRole === 'Responsável';
    const canSeeFullDetails = ['Professor', 'Responsável', 'Coordenador', 'Diretor', 'Admin Master'].includes(userRole);

    useEffect(() => {
        const currentPeriodInNewList = student.evaluations.find(p => p.period === evaluationPeriod?.period);
        
        if (currentPeriodInNewList) {
          setEvaluationPeriod(currentPeriodInNewList);
        } else {
          setEvaluationPeriod(student.evaluations[student.evaluations.length - 1]);
        }
    }, [student]);

    const handleSelectPeriod = (period: EvaluationPeriod) => {
        setEvaluationPeriod(period);
    };

    const handleAddNewPeriod = () => {
        setPeriodToEdit(null);
        setIsPeriodFormOpen(true);
    };
    
    const handleEditPeriod = (period: EvaluationPeriod) => {
        setPeriodToEdit(period);
        setIsPeriodFormOpen(true);
    };

    const handleSavePeriod = (details: NewPeriodDetails, originalPeriodName?: string) => {
        const trimmedName = details.periodName.trim();
        let updatedEvaluations = [...student.evaluations];
        let newActivePeriod: EvaluationPeriod | undefined = undefined;

        if (originalPeriodName) {
            // This is an update
            const evalIndex = updatedEvaluations.findIndex(e => e.period === originalPeriodName);
            if (evalIndex !== -1) {
                const updatedPeriod = {
                    ...updatedEvaluations[evalIndex],
                    period: trimmedName,
                    startDate: details.startDate,
                    endDate: details.endDate,
                };
                updatedEvaluations[evalIndex] = updatedPeriod;
                newActivePeriod = updatedPeriod;
            }
        } else {
            // This is a new period
            if (student.evaluations.some(e => e.period === trimmedName)) {
                alert("Já existe um período de avaliação com este nome.");
                return;
            }

            const latestEvaluation = student.evaluations.length > 0
                ? student.evaluations[student.evaluations.length - 1]
                : createDefaultEvaluation();

            const newEvaluation: EvaluationPeriod = {
                ...JSON.parse(JSON.stringify(latestEvaluation)),
                period: trimmedName,
                startDate: details.startDate,
                endDate: details.endDate,
                teacherNotes: '',
                psychoNotes: '',
                descriptiveReport: '',
            };
            updatedEvaluations.push(newEvaluation);
            newActivePeriod = newEvaluation;
        }

        const updatedStudent = {
            ...student,
            evaluations: updatedEvaluations,
        };

        onSave(updatedStudent);
        if (newActivePeriod) {
            setEvaluationPeriod(newActivePeriod);
        }
        setIsPeriodFormOpen(false);
        setPeriodToEdit(null);
        alert("Período salvo com sucesso!");
    };

    const handleSave = () => {
        const evalIndex = student.evaluations.findIndex(e => e.period === evaluationPeriod.period);
        const updatedEvaluations = [...student.evaluations];
        if (evalIndex !== -1) {
            updatedEvaluations[evalIndex] = evaluationPeriod;
        } else {
            updatedEvaluations.push(evaluationPeriod);
        }

        const updatedStudent = {
            ...student,
            evaluations: updatedEvaluations,
        };
        
        onSave(updatedStudent);
        alert("Dados salvos com sucesso!");
    };

    const handleAgendaSave = (updatedAgenda: AgendaEntry[]) => {
        const updatedStudent = {
            ...student,
            agenda: updatedAgenda,
        };
        onSave(updatedStudent);
        alert("Agenda salva com sucesso!");
    };

    const handleGenerateReport = async () => {
        if (!reportComponentRef.current) return;
        setIsGeneratingReportPdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(reportComponentRef.current, { scale: 2, useCORS: true, windowWidth: reportComponentRef.current.scrollWidth, windowHeight: reportComponentRef.current.scrollHeight });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`Relatorio_${student.name.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF.");
        } finally {
            setIsGeneratingReportPdf(false);
        }
    };
    
    const handleGenerateFilePdf = async () => {
        if (!studentFileRef.current) return;
        setIsGeneratingFilePdf(true);
        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(studentFileRef.current, { scale: 2, useCORS: true, windowWidth: studentFileRef.current.scrollWidth, windowHeight: studentFileRef.current.scrollHeight });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            // The template is designed to fit on a single page. The loop for multiple pages is not needed
            // and can cause a blank page if the rendered height is slightly off.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

            pdf.save(`Ficha_Cadastral_${student.name.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF da ficha.");
        } finally {
            setIsGeneratingFilePdf(false);
        }
    };

    const ParentInfoDisplay: React.FC<{ title: string, info?: ParentInfo }> = ({ title, info }) => {
        if (!info || !info.name) return null;
        return (
            <div className="md:col-span-2 border-t pt-4 mt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                    <p><strong>Nome:</strong> {info.name}</p>
                    <p><strong>Status:</strong> {info.isAlive ? 'Vivo(a)' : 'Falecido(a)'}</p>
                    {info.isAlive && (
                        <>
                            <p><strong>CPF:</strong> {info.cpf || 'Não informado'}</p>
                            <p><strong>Título de Eleitor:</strong> {info.voterId || 'Não informado'}</p>
                            <p><strong>Nacionalidade:</strong> {info.nationality || 'Não informado'}</p>
                            <p><strong>Naturalidade:</strong> {info.birthplace || 'Não informado'}</p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        if(!evaluationPeriod && !['agenda', 'horario', 'frequencia', 'info'].includes(activeTab)) {
            return (
                <div className="text-center p-8">
                    <p className="text-gray-500">Nenhuma avaliação encontrada para este período.</p>
                </div>
            );
        }

        switch(activeTab){
            case 'info':
                return (
                    <div className="space-y-4 text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {student.specialNeeds && (
                             <div className="md:col-span-2 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 my-4 rounded-r-lg" role="alert">
                                <div className="flex items-start">
                                    <div className="py-1">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold">Atenção: Aluno com Necessidades Específicas</p>
                                        <p className="text-sm whitespace-pre-wrap">{student.specialNeeds}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <p><strong>Data de Nascimento:</strong> {new Date(student.dob).toLocaleDateString('pt-BR')} ({calculateAge(student.dob)})</p>
                        {student.cpf && <p><strong>CPF:</strong> {student.cpf}</p>}
                        <p><strong>Ano de Início:</strong> {student.startYear || 'Não informado'}</p>
                        <p><strong>Responsáveis:</strong> {student.guardians.map(g => `${g.name} - ${g.phone}`).join(', ')}</p>
                        <p className="md:col-span-2"><strong>Endereço:</strong> {student.address || 'Não informado'}</p>
                        <p className="md:col-span-2"><strong>Observações Médicas:</strong> {student.medicalNotes || 'Nenhuma'}</p>
                        <p className="md:col-span-2"><strong>Restrições Alimentares:</strong> {student.foodRestrictions || 'Nenhuma'}</p>
                        
                        <ParentInfoDisplay title="Dados da Mãe" info={student.motherInfo} />
                        <ParentInfoDisplay title="Dados do Pai" info={student.fatherInfo} />
                    </div>
                );
            case 'development':
                return <DevelopmentSheet evaluationData={evaluationPeriod} setEvaluationData={setEvaluationPeriod} isEditable={!isParentView && (userRole === 'Professor' || userRole === 'Coordenador' || userRole === 'Admin Master')} />;
            case 'agenda':
                 return <StudentAgenda student={student} onSave={handleAgendaSave} isEditable={!isParentView && userRole === 'Professor'} />;
            case 'horario':
                 if (!data) return null;
                 return (
                     <WeeklySchedule
                         selectedClassId={student.classId}
                         classes={data.classes}
                         teachers={data.users}
                         isEditable={false}
                     />
                 );
            case 'frequencia':
                if (!data) return null;
                const studentAttendance = data.attendance.filter(a => a.studentId === student.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                const absences = studentAttendance.filter(a => a.status !== AttendanceStatus.Presente);

                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Registro de Frequência</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p><strong>Total de Faltas Registradas:</strong> {absences.length}</p>
                            {absences.length > 0 ? (
                                <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                    {absences.map(record => (
                                        <li key={record.id} className="flex justify-between items-center p-2 bg-white rounded-md border">
                                            <span>{new Date(record.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                record.status === AttendanceStatus.Ausente ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-4 text-gray-600">Nenhuma falta registrada para este aluno.</p>
                            )}
                        </div>
                    </div>
                );
            case 'descriptive':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">Relatório Descritivo da Professora</h3>
                        <p className="text-sm text-gray-500">Este espaço é destinado a um parecer descritivo sobre o desenvolvimento geral do aluno, suas conquistas, desafios e evolução ao longo do período.</p>
                        <textarea 
                            className="w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                            rows={12}
                            value={evaluationPeriod.descriptiveReport || ''}
                            readOnly={isParentView || userRole !== 'Professor'}
                            onChange={(e) => setEvaluationPeriod(prev => ({...prev, descriptiveReport: e.target.value}))}
                        />
                    </div>
                 );
            case 'psycho':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Parecer da Psicopedagoga</h3>
                        <textarea 
                            className="w-full p-2 border rounded bg-gray-50" 
                            rows={6}
                            value={evaluationPeriod.psychoNotes || ''}
                            readOnly={isParentView || userRole !== 'Psicopedagogo'}
                            onChange={(e) => setEvaluationPeriod(prev => ({...prev, psychoNotes: e.target.value}))}
                        />
                    </div>
                 );
            default:
                return null;
        }
    }
  
  const canEdit = !isParentView && (userRole === 'Coordenador' || userRole === 'Admin Master' || userRole === 'Professor' || userRole === 'Diretor');
  
  if (!data) return null;

  return (
    <>
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
          {evaluationPeriod && <ReportTemplate ref={reportComponentRef} student={student} evaluationPeriod={evaluationPeriod} />}
          <StudentFileTemplate ref={studentFileRef} student={student} classes={data.classes} />
      </div>

      {isPeriodFormOpen && (
          <PeriodForm
              periodToEdit={periodToEdit}
              allPeriods={student.evaluations}
              onSave={handleSavePeriod}
              onCancel={() => {
                  setIsPeriodFormOpen(false);
                  setPeriodToEdit(null);
              }}
          />
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-3xl font-bold text-gray-800">{student.name}</h2>
          {!isParentView && (
            <button onClick={onBack} className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                <span>Voltar</span>
            </button>
          )}
        </div>

        {['development', 'descriptive', 'psycho'].includes(activeTab) && (
            <div className="mb-6 mt-4">
                <div className="flex justify-between items-start">
                    <div>
                        <label className="text-gray-600 font-medium block mb-2">Período de Avaliação:</label>
                        <div className="flex flex-wrap items-center gap-2">
                            {student.evaluations.map(p => (
                                <div key={p.period} className="flex items-center group">
                                    <button
                                        onClick={() => handleSelectPeriod(p)}
                                        className={`py-1.5 text-sm font-semibold transition-colors rounded-full ${canEdit ? 'pr-2 pl-3' : 'px-3'} ${
                                            evaluationPeriod?.period === p.period
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                    >
                                        {p.period}
                                    </button>
                                    {canEdit && (
                                        <button 
                                            onClick={() => handleEditPeriod(p)}
                                            className={`-ml-1 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                                                evaluationPeriod?.period === p.period
                                                ? 'bg-blue-700 hover:bg-blue-800 text-white'
                                                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                            }`}
                                            title={`Editar período: ${p.period}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {evaluationPeriod?.startDate && evaluationPeriod?.endDate && (
                            <p className="text-sm text-gray-500 mt-2">
                                De {new Date(evaluationPeriod.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(evaluationPeriod.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>
                    {canEdit && (
                        <button
                            onClick={handleAddNewPeriod}
                            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2 text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>Novo Período</span>
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('development')} className={`${activeTab === 'development' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Ficha de Desenvolvimento
              </button>
               {canSeeFullDetails && (
                  <>
                    <button onClick={() => setActiveTab('descriptive')} className={`${activeTab === 'descriptive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                      Relatório Descritivo
                    </button>
                    <button onClick={() => setActiveTab('agenda')} className={`${activeTab === 'agenda' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}>
                      <span>Agenda</span>
                      {student.agenda?.find(a => a.importantNotice) && (
                        <span className="text-yellow-500" title="Existe um aviso importante na agenda">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </span>
                      )}
                    </button>
                    <button onClick={() => setActiveTab('horario')} className={`${activeTab === 'horario' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                      Horário Semanal
                    </button>
                    <button onClick={() => setActiveTab('frequencia')} className={`${activeTab === 'frequencia' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                      Frequência
                    </button>
                  </>
               )}
              <button onClick={() => setActiveTab('info')} className={`${activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Dados do Aluno
              </button>
              {(userRole === 'Psicopedagogo' || userRole === 'Coordenador' || evaluationPeriod?.psychoNotes) && !isParentView && (
              <button onClick={() => setActiveTab('psycho')} className={`${activeTab === 'psycho' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                Parecer Psicopedagógico
              </button>
              )}
            </nav>
          </div>
          
          <div className="py-4">
              {renderTabContent()}
          </div>
          
          {activeTab !== 'agenda' && (
            <div className="mt-8 flex justify-end items-center space-x-4">
                <button 
                    onClick={handleGenerateFilePdf}
                    disabled={isGeneratingFilePdf || isGeneratingReportPdf}
                    className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                    <span>{isGeneratingFilePdf ? 'Gerando Ficha...' : 'Gerar Ficha em PDF'}</span>
                </button>
                <button 
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReportPdf || isGeneratingFilePdf || !evaluationPeriod}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg>
                    <span>{isGeneratingReportPdf ? 'Gerando...' : 'Gerar Relatório'}</span>
                </button>
                {!isParentView && (userRole === 'Professor' || userRole === 'Coordenador' || userRole === 'Admin Master' || userRole === 'Psicopedagogo') && (
                  <>
                    <button onClick={onBack} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                  </>
                )}
            </div>
           )}
      </div>
    </>
  );
};

export default StudentProfile;