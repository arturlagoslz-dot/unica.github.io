import React, { useMemo, useState, useContext, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Student, Class, User, EvaluationLevel, DevelopmentAreaKeys } from '../types';
import { DEVELOPMENT_AREAS, EVALUATION_LEVEL_COLORS } from '../constants';
import StudentList from './StudentList';
import WeeklySchedule from './WeeklySchedule';
import { AuthContext, DataContext } from '../App';

// Adiciona as declarações para as bibliotecas globais (jspdf, html2canvas)
declare global {
    interface Window {
        html2canvas: (element: HTMLElement, options?: Partial<any>) => Promise<HTMLCanvasElement>;
        jspdf: {
            jsPDF: new (options?: any) => any;
        };
    }
}

interface CoordinatorDashboardProps {
  students: Student[];
  classes: Class[];
  teachers: User[];
  onSelectStudent: (student: Student) => void;
}

const PIE_CHART_COLORS = [
    EVALUATION_LEVEL_COLORS[EvaluationLevel.AtingidoComAutonomia].split(' ')[0].replace('bg-', '#').replace('-200', 'a0'),
    EVALUATION_LEVEL_COLORS[EvaluationLevel.Atingido].split(' ')[0].replace('bg-', '#').replace('-200', 'a0'),
    EVALUATION_LEVEL_COLORS[EvaluationLevel.EmDesenvolvimento].split(' ')[0].replace('bg-', '#').replace('-200', 'a0'),
    EVALUATION_LEVEL_COLORS[EvaluationLevel.NaoObservado].split(' ')[0].replace('bg-', '#').replace('-200', 'a0'),
].map(c => c.replace('blue', '60a5fa').replace('green', '4ade80').replace('yellow', 'facc15').replace('red', 'f87171'));


const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ students, classes, teachers, onSelectStudent }) => {
  const auth = useContext(AuthContext);
  const data = useContext(DataContext);
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeRecipient, setNoticeRecipient] = useState<'all' | number>('all');
  
  const [selectedScheduleClassId, setSelectedScheduleClassId] = useState<number | null>(classes[0]?.id || null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const schedulePdfRef = useRef<HTMLDivElement>(null);
  
  if (!data || !auth) return null;
  const { handleSaveNotice, handleDeleteStudent } = data;
  const { user } = auth;


  const classPerformanceData = useMemo(() => {
    return classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id);
      if(classStudents.length === 0) return { name: cls.name };

      const performance = Object.keys(DEVELOPMENT_AREAS).reduce((acc, area) => {
        const key = area as DevelopmentAreaKeys;
        let totalScore = 0;
        let count = 0;
        
        classStudents.forEach(student => {
          const evalArea = student.evaluations[0]?.evaluations[key];
          if(evalArea) {
              Object.values(evalArea).forEach(level => {
                count++;
                if(level === EvaluationLevel.Atingido) totalScore += 2;
                if(level === EvaluationLevel.AtingidoComAutonomia) totalScore += 3;
                if(level === EvaluationLevel.EmDesenvolvimento) totalScore += 1;
              });
          }
        });
        acc[DEVELOPMENT_AREAS[key].title] = count > 0 ? (totalScore / (count*3) * 100).toFixed(1) : 0;
        return acc;
      }, {} as Record<string, string | number>);
      
      return {
        name: cls.name,
        ...performance
      }
    });
  }, [students, classes]);
  
  const overallDistributionData = useMemo(() => {
    const distribution: Record<EvaluationLevel, number> = {
      [EvaluationLevel.NaoObservado]: 0,
      [EvaluationLevel.EmDesenvolvimento]: 0,
      [EvaluationLevel.Atingido]: 0,
      [EvaluationLevel.AtingidoComAutonomia]: 0,
    };
    
    students.forEach(student => {
      const latestEval = student.evaluations[0];
      if (latestEval) {
        Object.values(latestEval.evaluations).forEach(area => {
          Object.values(area).forEach(level => {
            distribution[level]++;
          });
        });
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [students]);

  const studentsWithAlerts = useMemo(() => {
      return students.filter(student => {
          let notObservedCount = 0;
          const latestEval = student.evaluations[0];
           if (latestEval) {
                Object.values(latestEval.evaluations).forEach(area => {
                Object.values(area).forEach(level => {
                    if (level === EvaluationLevel.NaoObservado) {
                        notObservedCount++;
                    }
                });
                });
            }
            return notObservedCount > 4; // Alert if more than 4 skills are "Not Observed"
      });
  }, [students]);
  
  const filteredStudents = useMemo(() => {
      if (selectedClassId === 'all') {
          return students;
      }
      return students.filter(student => student.classId === selectedClassId);
  }, [students, selectedClassId]);

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeContent.trim() || !user) return;
    
    handleSaveNotice({
        content: noticeContent,
        senderId: user.id,
        recipientId: noticeRecipient === 'all' ? 'all' : Number(noticeRecipient),
    });

    setNoticeContent('');
    setNoticeRecipient('all');
    alert('Aviso enviado com sucesso!');
  };
  
   const handleGenerateSchedulePdf = async () => {
        if (!schedulePdfRef.current || !selectedScheduleClassId) return;
        setIsGeneratingPdf(true);
        try {
            const selectedClass = classes.find(c => c.id === selectedScheduleClassId);
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


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Painel da Coordenação</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Mural de Avisos</h3>
          <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                  <label htmlFor="notice-content" className="block text-sm font-medium text-gray-700">Mensagem</label>
                  <textarea 
                      id="notice-content"
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      rows={4}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Escreva um aviso para os professores..."
                  />
              </div>
              <div className="flex justify-between items-end">
                  <div>
                      <label htmlFor="notice-recipient" className="block text-sm font-medium text-gray-700">Enviar para</label>
                      <select 
                          id="notice-recipient"
                          value={noticeRecipient}
                          onChange={(e) => setNoticeRecipient(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                          <option value="all">Todos os Professores</option>
                          {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                          ))}
                      </select>
                  </div>
                  <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                      <span>Enviar Aviso</span>
                  </button>
              </div>
          </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-700">Gestão de Horários</h3>
            <div className="flex items-center space-x-4">
                <select 
                    value={selectedScheduleClassId || ''}
                    onChange={(e) => setSelectedScheduleClassId(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                </select>
                <button 
                    onClick={handleGenerateSchedulePdf}
                    disabled={isGeneratingPdf || !selectedScheduleClassId}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center space-x-2 transition-colors disabled:bg-green-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clipRule="evenodd" /></svg>
                    <span>{isGeneratingPdf ? 'Gerando...' : 'Gerar PDF'}</span>
                </button>
            </div>
        </div>
        {selectedScheduleClassId ? (
            <WeeklySchedule
              ref={schedulePdfRef}
              selectedClassId={selectedScheduleClassId}
              classes={classes}
              teachers={teachers}
            />
        ) : (
            <p className="text-center text-gray-500 py-8">Selecione uma turma para ver o horário.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Desempenho Geral por Turma (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={DEVELOPMENT_AREAS.motor.title} fill="#8884d8" name="Motor" />
              <Bar dataKey={DEVELOPMENT_AREAS.cognitive.title} fill="#82ca9d" name="Cognitivo"/>
              <Bar dataKey={DEVELOPMENT_AREAS.language.title} fill="#ffc658" name="Linguagem"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Distribuição Geral de Níveis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={overallDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {overallDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {studentsWithAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
           <h3 className="text-xl font-semibold text-red-600 mb-4">Alunos com Sinais de Alerta</h3>
           <p className="text-sm text-gray-600 mb-4">Alunos com 5 ou mais habilidades marcadas como "Não observado".</p>
           <StudentList students={studentsWithAlerts} onSelectStudent={onSelectStudent} classes={classes} onDelete={handleDeleteStudent} />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
           <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Acesso Rápido aos Alunos</h3>
                <div className="flex flex-wrap gap-2 border-b pb-4">
                    <button 
                        onClick={() => setSelectedClassId('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedClassId === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Todas as Turmas
                    </button>
                    {classes.map(cls => (
                         <button 
                            key={cls.id}
                            onClick={() => setSelectedClassId(cls.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedClassId === cls.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
           </div>
            <StudentList students={filteredStudents} onSelectStudent={onSelectStudent} classes={classes} onDelete={handleDeleteStudent}/>
      </div>

    </div>
  );
};

export default CoordinatorDashboard;