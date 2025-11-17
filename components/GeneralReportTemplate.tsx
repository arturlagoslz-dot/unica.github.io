import React from 'react';
import { Student, Class } from '../types';

interface GeneralReportTemplateProps {
    stats: {
        total: number;
        boys: number;
        girls: number;
        atypical: number;
        allergies: number;
    };
    atypicalStudents: Student[];
    studentsWithAllergies: Student[];
    classes: Class[];
}

const ReportTable: React.FC<{title: string, students: Student[], classes: Class[], dataExtractor: (s: Student) => string | undefined}> = ({title, students: studentList, classes, dataExtractor}) => (
    <div style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <h3 className="text-base font-bold text-gray-800 mb-2 bg-gray-100 p-2 rounded border-b-2 border-gray-300">{title}</h3>
        {studentList.length > 0 ? (
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="border border-gray-400 p-1.5 text-left w-1/3">Nome do Aluno</th>
                        <th className="border border-gray-400 p-1.5 text-left w-1/3">Turma</th>
                        <th className="border border-gray-400 p-1.5 text-left w-1/3">Observação</th>
                    </tr>
                </thead>
                <tbody>
                    {studentList.map(s => (
                        <tr key={s.id} className="bg-white border-b">
                            <td className="border border-gray-400 p-1.5 font-medium">{s.name}</td>
                            <td className="border border-gray-400 p-1.5">{classes.find(c => c.id === s.classId)?.name || 'N/A'}</td>
                            <td className="border border-gray-400 p-1.5 whitespace-pre-wrap">{dataExtractor(s)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <p className="text-center text-gray-600 p-4 border rounded-md">Nenhum aluno encontrado nesta categoria.</p>
        )}
    </div>
);

const GeneralReportTemplate = React.forwardRef<HTMLDivElement, GeneralReportTemplateProps>(({ stats, atypicalStudents, studentsWithAllergies, classes }, ref) => {
    
    return (
        <div ref={ref} className="p-8 bg-white" style={{ width: '297mm', minHeight: '210mm', fontFamily: 'sans-serif', color: '#000' }}>
            <header className="mb-8 border-b-2 border-gray-400 pb-4 text-center">
                <div>
                    <h1 className="text-lg font-bold text-gray-800">UNIVERSIDADE DA CRIANÇA</h1>
                    <p className="text-xs text-gray-600 leading-tight">
                        Fundada em 02 de dezembro de 2002 - Escola Comunitária<br />
                        Registrada Sob Nº 22.008 - CNPJ: 05.752.926/0001-57- INEP 21019002<br />
                        Autorizada pelo Conselho Municipal de Educação - Resolução n° 26/2023<br />
                        Autorizada pelo Conselho Estadual de Educação - Resolução n° 115/2015
                    </p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">Relatório Geral de Alunos</h2>
                </div>
            </header>

            <section className="mb-6" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <h2 className="text-lg font-bold text-gray-800 mb-3 bg-gray-100 p-2 rounded border-b-2 border-gray-300">Resumo Estatístico</h2>
                <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                        <p className="text-sm font-semibold text-gray-700">Total de Alunos Ativos</p>
                    </div>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-sky-600">{stats.boys}</p>
                        <p className="text-sm font-semibold text-gray-700">Meninos</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-pink-600">{stats.girls}</p>
                        <p className="text-sm font-semibold text-gray-700">Meninas</p>
                    </div>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-indigo-600">{stats.atypical}</p>
                        <p className="text-sm font-semibold text-gray-700">Alunos Atípicos</p>
                    </div>
                     <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-3xl font-bold text-red-600">{stats.allergies}</p>
                        <p className="text-sm font-semibold text-gray-700">Alunos com Alergias/Restrições Médicas</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <ReportTable
                    title="Alunos Atípicos (com Necessidades Específicas)"
                    students={atypicalStudents}
                    classes={classes}
                    dataExtractor={(s) => s.specialNeeds}
                />
                <ReportTable
                    title="Alunos com Alergias/Restrições"
                    students={studentsWithAllergies}
                    classes={classes}
                    dataExtractor={(s) => `${s.medicalNotes || ''} ${s.foodRestrictions || ''}`.trim()}
                />
            </section>

             <footer className="mt-16 pt-8 text-center text-xs text-gray-500" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div className="border-t-2 border-gray-400 w-1/2 mx-auto mb-2"></div>
                <p className="font-semibold">Assinatura da Direção</p>
                <p className="mt-4">Documento gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </footer>
        </div>
    );
});

export default GeneralReportTemplate;