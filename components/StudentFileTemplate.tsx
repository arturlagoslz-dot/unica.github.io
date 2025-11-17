import React from 'react';
import { Student, Class } from '../types';

interface StudentFileTemplateProps {
  student: Student;
  classes: Class[];
}

const calculateAge = (dob: string) => {
  if (!dob) return 'Não informada';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} anos`;
};

const DataField: React.FC<{ label: string; value?: string | number | null; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
        <p className="text-xs text-gray-500 leading-tight mb-0">{label}</p>
        <p className="font-semibold text-sm leading-snug break-words">{value || 'Não informado'}</p>
    </div>
);


const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-2" style={{ breakInside: 'avoid' }}>
        <h3 className="text-sm font-bold text-gray-800 bg-gray-100 border-b-2 border-gray-300 p-1 mb-1.5">{title}</h3>
        <div className="px-1">
            {children}
        </div>
    </section>
);

const StudentFileTemplate = React.forwardRef<HTMLDivElement, StudentFileTemplateProps>(({ student, classes }, ref) => {
    
    const studentClass = classes.find(c => c.id === student.classId);

    const motherVoterId = student.motherInfo?.voterId 
      ? `Nº: ${student.motherInfo.voterId} | Zona: ${student.motherInfo.voterZone || 'N/A'} | Seção: ${student.motherInfo.voterSection || 'N/A'}`
      : 'Não informado';

    const fatherVoterId = student.fatherInfo?.voterId
      ? `Nº: ${student.fatherInfo.voterId} | Zona: ${student.fatherInfo.voterZone || 'N/A'} | Seção: ${student.fatherInfo.voterSection || 'N/A'}`
      : 'Não informado';

    return (
        <div ref={ref} id="student-file-content" className="p-6 bg-white flex flex-col" style={{ width: '210mm', height: '297mm', fontFamily: 'sans-serif', color: '#000' }}>
            <header className="mb-4 border-b-2 border-gray-400 pb-2 text-center">
                <div>
                    <h1 className="text-lg font-bold text-gray-800">UNIVERSIDADE DA CRIANÇA</h1>
                    <p className="text-xs text-gray-600 leading-tight">
                        Fundada em 02 de dezembro de 2002 - Escola Comunitária<br />
                        Registrada Sob Nº 22.008 - CNPJ: 05.752.926/0001-57- INEP 21019002<br />
                        Autorizada pelo Conselho Municipal de Educação - Resolução n° 26/2023<br />
                        Autorizada pelo Conselho Estadual de Educação - Resolução n° 115/2015
                    </p>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Ficha Cadastral do Aluno</h2>
                </div>
            </header>

            <main className="flex-grow">
                <Section title="Dados Pessoais">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <DataField label="Nome Completo do Aluno" value={student.name} />
                        <DataField label="Data de Nascimento" value={new Date(student.dob + 'T00:00:00').toLocaleDateString('pt-BR')} />
                        <DataField label="Idade na data de hoje" value={calculateAge(student.dob)} />
                        <DataField label="CPF" value={student.cpf} />
                        <DataField label="Endereço" value={student.address} fullWidth />
                    </div>
                </Section>

                <Section title="Filiação">
                    {/* Mother's Info */}
                    <div className="pt-1">
                        <h4 className="font-bold mb-1 text-sm">Mãe</h4>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                            <div className="col-span-2"><DataField label="Nome da Mãe" value={student.motherInfo?.name} /></div>
                            <DataField label="Status" value={student.motherInfo ? (student.motherInfo.isAlive ? 'Viva' : 'Falecida') : 'Não informado'} />
                            {student.motherInfo?.isAlive && (
                                <>
                                    <DataField label="CPF" value={student.motherInfo.cpf} />
                                    <DataField label="Título de Eleitor (Nº | Zona | Seção)" value={motherVoterId} fullWidth />
                                    <DataField label="Nacionalidade" value={student.motherInfo.nationality} />
                                    <DataField label="Naturalidade (UF)" value={student.motherInfo.birthplace} />
                                </>
                            )}
                        </div>
                    </div>
                    {/* Father's Info */}
                    <div className="border-t pt-1.5 mt-1.5">
                        <h4 className="font-bold mb-1 text-sm">Pai</h4>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                            <div className="col-span-2"><DataField label="Nome do Pai" value={student.fatherInfo?.name} /></div>
                            <DataField label="Status" value={student.fatherInfo ? (student.fatherInfo.isAlive ? 'Vivo' : 'Falecido') : 'Não informado'} />
                            {student.fatherInfo?.isAlive && (
                                <>
                                    <DataField label="CPF" value={student.fatherInfo.cpf} />
                                    <DataField label="Título de Eleitor (Nº | Zona | Seção)" value={fatherVoterId} fullWidth />
                                    <DataField label="Nacionalidade" value={student.fatherInfo.nationality} />
                                    <DataField label="Naturalidade (UF)" value={student.fatherInfo.birthplace} />
                                </>
                            )}
                        </div>
                    </div>
                </Section>
                
                <Section title="Dados da Matrícula">
                     <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                        <DataField label="Responsável Principal" value={student.guardians[0]?.name} />
                        <DataField label="Telefone do Responsável" value={student.guardians[0]?.phone} />
                        <DataField label="Turma" value={studentClass?.name} />
                        <DataField label="Turno" value={student.shift} />
                        <DataField label="Ano de Início" value={student.startYear} />
                        <DataField label="Status" value={student.status === 'active' ? 'Ativo' : 'Inativo'} />
                    </div>
                </Section>
                
                <Section title="Informações Adicionais de Saúde e Apoio">
                    <div className="grid grid-cols-1 gap-y-1.5">
                        <DataField label="Observações Médicas" value={student.medicalNotes} />
                        <DataField label="Restrições Alimentares" value={student.foodRestrictions} />
                        <DataField label="Histórico Escolar Anterior" value={student.schoolHistory} />
                        <DataField label="Necessidades Específicas" value={student.specialNeeds} />
                    </div>
                </Section>
            </main>

            <footer className="pt-2 text-center text-sm" style={{ breakInside: 'avoid' }}>
                <div className="flex justify-around">
                    <div className="w-1/2">
                        <div className="border-t-2 border-gray-400 w-2/3 mx-auto mb-1"></div>
                        <p className="text-xs">Assinatura do Responsável</p>
                    </div>
                    <div className="w-1/2">
                        <div className="border-t-2 border-gray-400 w-2/3 mx-auto mb-1"></div>
                        <p className="text-xs">Assinatura da Direção/Coordenação</p>
                    </div>
                </div>
                 <p className="mt-3 text-xs text-gray-500">Documento gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </footer>
        </div>
    );
});

export default StudentFileTemplate;