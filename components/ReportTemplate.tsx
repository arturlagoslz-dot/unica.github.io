import React from 'react';
import { Student, EvaluationPeriod, EvaluationLevel, DevelopmentAreaKeys } from '../types';
import { DEVELOPMENT_AREAS, EVALUATION_LEVEL_COLORS } from '../constants';
import { CLASSES, USERS } from '../data/mockData';

interface ReportTemplateProps {
  student: Student;
  evaluationPeriod: EvaluationPeriod;
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

const ReportTemplate = React.forwardRef<HTMLDivElement, ReportTemplateProps>(({ student, evaluationPeriod }, ref) => {
    
    const studentClass = CLASSES.find(c => c.id === student.classId);
    const teacher = USERS.find(u => u.id === studentClass?.teacherId);

    const noBreakInside: React.CSSProperties = { pageBreakInside: 'avoid', breakInside: 'avoid' };

    return (
        <div ref={ref} id="report-content" className="p-10 bg-white" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif', color: '#000' }}>
            <header className="mb-10 border-b-2 border-gray-300 pb-4 text-center" style={noBreakInside}>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">UNIVERSIDADE DA CRIANÇA</h1>
                    <p className="text-xs text-gray-600 leading-tight">
                        Fundada em 02 de dezembro de 2002 - Escola Comunitária<br />
                        Registrada Sob Nº 22.008 - CNPJ: 05.752.926/0001-57- INEP 21019002<br />
                        Autorizada pelo Conselho Municipal de Educação - Resolução n° 26/2023<br />
                        Autorizada pelo Conselho Estadual de Educação - Resolução n° 115/2015
                    </p>
                </div>
            </header>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Relatório de Desenvolvimento Infantil</h2>
                <h3 className="text-xl font-semibold text-blue-600">{student.name}</h3>
            </div>


            <section className="mb-8" style={noBreakInside}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Aluno(a):</strong> {student.name}</div>
                    <div><strong>Idade:</strong> {calculateAge(student.dob)}</div>
                    <div><strong>Turma:</strong> {studentClass?.name || 'N/A'}</div>
                    <div><strong>Professora:</strong> {teacher?.name || 'N/A'}</div>
                    <div className="col-span-2">
                        <strong>Período:</strong> {evaluationPeriod.period}
                        {evaluationPeriod.startDate && evaluationPeriod.endDate && (
                            <span className="ml-2 text-gray-600">
                                de {new Date(evaluationPeriod.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(evaluationPeriod.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                        )}
                    </div>
                    <div><strong>Turno:</strong> {student.shift}</div>
                </div>
            </section>
            
            <section className="space-y-6">
                {Object.entries(DEVELOPMENT_AREAS).map(([areaKey, areaData]) => (
                    <div key={areaKey} style={{...noBreakInside, pageBreakAfter: 'auto'}}>
                        <h3 className="text-xl font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">{areaData.title}</h3>
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 p-2 text-left w-2/3">Habilidade</th>
                                    <th className="border border-gray-300 p-2 text-left">Nível</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(areaData.skills).map(([skillKey, skillLabel]) => {
                                    const level = evaluationPeriod.evaluations[areaKey as DevelopmentAreaKeys]?.[skillKey] || EvaluationLevel.NaoObservado;
                                    const colorClass = EVALUATION_LEVEL_COLORS[level] || 'bg-gray-200';
                                    return (
                                        <tr key={skillKey}>
                                            <td className="border border-gray-300 p-2">{skillLabel}</td>
                                            <td className="border border-gray-300 p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                                                    {level}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </section>

            {evaluationPeriod.descriptiveReport && (
                 <section className="mt-8" style={{...noBreakInside, pageBreakBefore: 'auto'}}>
                    <h3 className="text-xl font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Relatório Descritivo</h3>
                    <p className="p-2 border rounded min-h-[100px] text-sm break-words whitespace-pre-wrap">{evaluationPeriod.descriptiveReport}</p>
                </section>
            )}
            
            <section className="mt-8" style={{...noBreakInside, pageBreakBefore: 'auto'}}>
                <h3 className="text-xl font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Observações da Professora</h3>
                <p className="p-2 border rounded min-h-[100px] text-sm break-words whitespace-pre-wrap">{evaluationPeriod.teacherNotes || 'Nenhuma observação registrada.'}</p>
            </section>

            {evaluationPeriod.psychoNotes && (
                 <section className="mt-8" style={{...noBreakInside, pageBreakBefore: 'auto'}}>
                    <h3 className="text-xl font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Parecer Psicopedagógico</h3>
                    <p className="p-2 border rounded min-h-[100px] text-sm break-words whitespace-pre-wrap">{evaluationPeriod.psychoNotes}</p>
                </section>
            )}

            <footer className="mt-20 pt-10 text-center text-sm" style={{...noBreakInside, pageBreakBefore: 'auto'}}>
                <div className="flex justify-around">
                    <div className="w-1/2">
                        <div className="border-t border-gray-400 w-2/3 mx-auto mb-2"></div>
                        <p>{teacher?.name || 'Assinatura da Professora'}</p>
                    </div>
                    <div className="w-1/2">
                        <div className="border-t border-gray-400 w-2/3 mx-auto mb-2"></div>
                        <p>Assinatura da Coordenação</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default ReportTemplate;