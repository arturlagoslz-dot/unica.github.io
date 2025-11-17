import React, { useState, useContext, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthContext, DataContext } from '../App';
import { Student, Class, User, Role } from '../types';
import StudentFileTemplate from './StudentFileTemplate';
import ClassForm from './ClassForm';
import StudentProfile from './StudentProfile';
import GeneralReportTemplate from './GeneralReportTemplate';


const INITIAL_FORM_STATE = {
    name: '',
    cpf: '',
    dob: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino',
    motherName: '',
    motherIsAlive: true,
    motherCpf: '',
    motherVoterId: '',
    motherVoterZone: '',
    motherVoterSection: '',
    motherNationality: 'Brasileira',
    motherBirthplace: '',
    fatherName: '',
    fatherIsAlive: true,
    fatherCpf: '',
    fatherVoterId: '',
    fatherVoterZone: '',
    fatherVoterSection: '',
    fatherNationality: 'Brasileira',
    fatherBirthplace: '',
    address: '',
    startYear: new Date().getFullYear(),
    classId: 0,
    shift: 'Manhã' as 'Manhã' | 'Tarde',
    guardianName: '',
    guardianPhone: '',
    medicalNotes: '',
    foodRestrictions: '',
    schoolHistory: '',
    specialNeeds: '',
};

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// --- Helper Components ---

const FormField: React.FC<{ name: string, label: string, required?: boolean, children: React.ReactNode }> = ({ name, label, required, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
     <textarea {...props} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
     <select {...props} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
);
    
const ParentFormField: React.FC<{
    parentType: 'mother' | 'father';
    label: string;
    formData: typeof INITIAL_FORM_STATE;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}> = ({ parentType, label, formData, handleChange }) => {
    const isAlive = formData[`${parentType}IsAlive`];
    const isDisabled = !isAlive;
    const nameKey = `${parentType}Name` as keyof typeof INITIAL_FORM_STATE;
    const isAliveKey = `${parentType}IsAlive` as keyof typeof INITIAL_FORM_STATE;
    const cpfKey = `${parentType}Cpf` as keyof typeof INITIAL_FORM_STATE;
    const voterIdKey = `${parentType}VoterId` as keyof typeof INITIAL_FORM_STATE;
    const voterZoneKey = `${parentType}VoterZone` as keyof typeof INITIAL_FORM_STATE;
    const voterSectionKey = `${parentType}VoterSection` as keyof typeof INITIAL_FORM_STATE;
    const nationalityKey = `${parentType}Nationality` as keyof typeof INITIAL_FORM_STATE;
    const birthplaceKey = `${parentType}Birthplace` as keyof typeof INITIAL_FORM_STATE;

    return (
        <fieldset className="space-y-4 border-t pt-6">
            <legend className="text-lg font-semibold text-gray-700 -mt-2">
                <div className="flex items-center space-x-4">
                    <span>{label}</span>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" name={isAliveKey} id={isAliveKey} checked={isAlive} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label htmlFor={isAliveKey} className="text-sm font-medium text-gray-600 cursor-pointer">{isAlive ? 'Vivo(a)' : 'Falecido(a)'}</label>
                    </div>
                </div>
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField name={nameKey} label="Nome Completo">
                    <FormInput type="text" name={nameKey} id={nameKey} value={formData[nameKey] as string} onChange={handleChange} />
                </FormField>
                <FormField name={cpfKey} label="CPF">
                    <FormInput type="text" name={cpfKey} id={cpfKey} value={formData[cpfKey] as string} onChange={handleChange} disabled={isDisabled} />
                </FormField>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título de Eleitor</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label htmlFor={voterIdKey} className="block text-xs text-gray-500">Número</label>
                            <input type="text" name={voterIdKey} id={voterIdKey} value={formData[voterIdKey] as string} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                        </div>
                        <div>
                            <label htmlFor={voterZoneKey} className="block text-xs text-gray-500">Zona</label>
                            <input type="text" name={voterZoneKey} id={voterZoneKey} value={formData[voterZoneKey] as string} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                        </div>
                        <div>
                            <label htmlFor={voterSectionKey} className="block text-xs text-gray-500">Seção</label>
                            <input type="text" name={voterSectionKey} id={voterSectionKey} value={formData[voterSectionKey] as string} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                        </div>
                    </div>
                </div>
                <FormField name={nationalityKey} label="Nacionalidade">
                   <FormSelect name={nationalityKey} id={nationalityKey} value={formData[nationalityKey] as string} onChange={handleChange} disabled={isDisabled}>
                        <option>Brasileira</option>
                        <option>Estrangeira</option>
                   </FormSelect>
                </FormField>
                <FormField name={birthplaceKey} label="Naturalidade (UF)">
                    <FormSelect name={birthplaceKey} id={birthplaceKey} value={formData[birthplaceKey] as string} onChange={handleChange} disabled={isDisabled}>
                        <option value="">Selecione o Estado</option>
                        {BRAZILIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                    </FormSelect>
                </FormField>
            </div>
        </fieldset>
    );
};

const MenuButton: React.FC<{
    label: string;
    view: 'enrollment' | 'students' | 'classes' | 'reports';
    activeView: 'enrollment' | 'students' | 'classes' | 'reports';
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, view, activeView, onClick, children }) => (
     <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
            activeView === view
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
        {children}
        <span>{label}</span>
    </button>
);


// --- Componente Principal ---

const DirectorDashboard: React.FC = () => {
    const data = useContext(DataContext);
    const auth = useContext(AuthContext);
    const [activeView, setActiveView] = useState<'enrollment' | 'students' | 'classes' | 'reports'>('enrollment');
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
    const [isGeneratingReportPdf, setIsGeneratingReportPdf] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
    const [isClassFormOpen, setIsClassFormOpen] = useState(false);
    const [classToEdit, setClassToEdit] = useState<Class | null>(null);
    const [selectedClassIdForStudentList, setSelectedClassIdForStudentList] = useState<number | null>(null);
    const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
    
    if (!data || !auth || !auth.user) return <div>Carregando...</div>;

    const { students, classes, users, handleSaveStudent, handleDeleteStudent, handleSaveClass, handleDeleteClass } = data;
    const { user } = auth;
    
    useEffect(() => {
        if (classes.length > 0 && formData.classId === 0) {
            setFormData(currentFormData => ({
                ...currentFormData,
                classId: classes[0].id
            }));
        }
    }, [classes, formData.classId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'classId' || name === 'startYear' ? parseInt(value) : value }));
        }
    };

    const handleGeneratePdf = async (student: Student) => {
        if (generatingPdfId) return;
        setGeneratingPdfId(student.id);

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '210mm';
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <StudentFileTemplate student={student} classes={classes} />
            </React.StrictMode>
        );

        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(container, {
                 scale: 2,
                 useCORS: true,
                 width: container.scrollWidth,
                 height: container.scrollHeight,
                 windowWidth: container.scrollWidth,
                 windowHeight: container.scrollHeight,
             });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);

            pdf.save(`Ficha_Cadastral_${student.name.replace(/\s/g, '_')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF da ficha.");
        } finally {
            root.unmount();
            document.body.removeChild(container);
            setGeneratingPdfId(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.dob || !formData.classId || !formData.guardianName || !formData.guardianPhone) {
            alert('Por favor, preencha todos os campos obrigatórios (Nome, Data de Nasc., Turma e Responsável).');
            return;
        }

        const newStudentData: Omit<Student, 'id' | 'evaluations'> = {
            name: formData.name,
            cpf: formData.cpf,
            dob: formData.dob,
            gender: formData.gender,
            motherInfo: formData.motherName ? {
                name: formData.motherName,
                isAlive: formData.motherIsAlive,
                cpf: formData.motherIsAlive ? formData.motherCpf : undefined,
                voterId: formData.motherIsAlive ? formData.motherVoterId : undefined,
                voterZone: formData.motherIsAlive ? formData.motherVoterZone : undefined,
                voterSection: formData.motherIsAlive ? formData.motherVoterSection : undefined,
                nationality: formData.motherIsAlive ? formData.motherNationality : undefined,
                birthplace: formData.motherIsAlive ? formData.motherBirthplace : undefined,
            } : undefined,
            fatherInfo: formData.fatherName ? {
                name: formData.fatherName,
                isAlive: formData.fatherIsAlive,
                cpf: formData.fatherIsAlive ? formData.fatherCpf : undefined,
                voterId: formData.fatherIsAlive ? formData.fatherVoterId : undefined,
                voterZone: formData.fatherIsAlive ? formData.fatherVoterZone : undefined,
                voterSection: formData.fatherIsAlive ? formData.fatherVoterSection : undefined,
                nationality: formData.fatherIsAlive ? formData.fatherNationality : undefined,
                birthplace: formData.fatherIsAlive ? formData.fatherBirthplace : undefined,
            } : undefined,
            address: formData.address,
            startYear: formData.startYear,
            classId: formData.classId,
            shift: formData.shift,
            status: 'active',
            guardians: [{ name: formData.guardianName, phone: formData.guardianPhone }],
            medicalNotes: formData.medicalNotes,
            foodRestrictions: formData.foodRestrictions,
            schoolHistory: formData.schoolHistory,
            specialNeeds: formData.specialNeeds,
        };

        handleSaveStudent(newStudentData);
        alert(`Aluno(a) ${formData.name} matriculado(a) com sucesso!`);
        const resetState = {...INITIAL_FORM_STATE, classId: classes.length > 0 ? classes[0].id : 0};
        setFormData(resetState);
    };

    const handleRematricula = (student: Student) => {
        setFormData({
            name: student.name,
            cpf: student.cpf || '',
            dob: student.dob,
            gender: student.gender || 'Masculino',
            motherName: student.motherInfo?.name || '',
            motherIsAlive: student.motherInfo?.isAlive ?? true,
            motherCpf: student.motherInfo?.cpf || '',
            motherVoterId: student.motherInfo?.voterId || '',
            motherVoterZone: student.motherInfo?.voterZone || '',
            motherVoterSection: student.motherInfo?.voterSection || '',
            motherNationality: student.motherInfo?.nationality || 'Brasileira',
            motherBirthplace: student.motherInfo?.birthplace || '',
            fatherName: student.fatherInfo?.name || '',
            fatherIsAlive: student.fatherInfo?.isAlive ?? true,
            fatherCpf: student.fatherInfo?.cpf || '',
            fatherVoterId: student.fatherInfo?.voterId || '',
            fatherVoterZone: student.fatherInfo?.voterZone || '',
            fatherVoterSection: student.fatherInfo?.voterSection || '',
            fatherNationality: student.fatherInfo?.nationality || 'Brasileira',
            fatherBirthplace: student.fatherInfo?.birthplace || '',
            address: student.address || '',
            startYear: new Date().getFullYear(), // Update to current year for re-enrollment
            classId: student.classId,
            shift: student.shift,
            guardianName: student.guardians[0]?.name || '',
            guardianPhone: student.guardians[0]?.phone || '',
            medicalNotes: student.medicalNotes || '',
            foodRestrictions: student.foodRestrictions,
            schoolHistory: 'Rematrícula. Histórico anterior no sistema.',
            specialNeeds: student.specialNeeds || '',
        });
        setActiveView('enrollment');
        alert(`Dados de ${student.name} carregados para rematrícula. Verifique as informações e salve para confirmar.`);
    };
    
    const availableYears = useMemo(() => {
        const years = new Set(students.map(s => s.startYear).filter((y): y is number => y != null));
        // FIX: Ensure values being sorted are numbers to prevent type errors.
        return Array.from(years).sort((a, b) => Number(b) - Number(a)); // Sort descending
    }, [students]);

    const filteredStudents = useMemo(() => {
        let studentsToFilter = students;

        if (selectedYear !== 'all') {
            studentsToFilter = studentsToFilter.filter(s => s.startYear === selectedYear);
        }

        if (searchQuery) {
            studentsToFilter = studentsToFilter.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return studentsToFilter;
    }, [students, searchQuery, selectedYear]);


    // --- Handlers for Class management ---
    const handleAddNewClass = () => {
        setClassToEdit(null);
        setIsClassFormOpen(true);
    };

    const handleEditClass = (cls: Class) => {
        setClassToEdit(cls);
        setIsClassFormOpen(true);
    };

    const handleSaveClassWrapper = (classData: Omit<Class, 'id'> & { id?: number }) => {
        handleSaveClass(classData);
        setIsClassFormOpen(false);
        setClassToEdit(null);
    };
    
    const handleDeleteClassWrapper = (cls: Class) => {
        const studentsInClass = students.filter(s => s.classId === cls.id).length;
        if (studentsInClass > 0) {
            alert(`Não é possível excluir a turma "${cls.name}" pois ela possui ${studentsInClass} aluno(s) matriculado(s).`);
            return;
        }
        handleDeleteClass(cls.id);
    };

    // --- Report Logic ---
    const reportData = useMemo(() => {
        const activeStudents = students.filter(s => s.status === 'active');
        const atypicalStudents = activeStudents.filter(s => s.specialNeeds && s.specialNeeds.trim() !== '');
        const studentsWithAllergies = activeStudents.filter(s => 
            (s.foodRestrictions && s.foodRestrictions.trim() !== '') || 
            (s.medicalNotes && s.medicalNotes.trim() !== '')
        );

        return {
            stats: {
                total: activeStudents.length,
                boys: activeStudents.filter(s => s.gender === 'Masculino').length,
                girls: activeStudents.filter(s => s.gender === 'Feminino').length,
                atypical: atypicalStudents.length,
                allergies: studentsWithAllergies.length,
            },
            atypicalStudents,
            studentsWithAllergies
        };
    }, [students]);

     const handleGenerateGeneralReportPdf = async () => {
        if (isGeneratingReportPdf) return;
        setIsGeneratingReportPdf(true);

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '297mm';
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <GeneralReportTemplate
                    stats={reportData.stats}
                    atypicalStudents={reportData.atypicalStudents}
                    studentsWithAllergies={reportData.studentsWithAllergies}
                    classes={classes}
                />
            </React.StrictMode>
        );
        
        await new Promise(resolve => setTimeout(resolve, 500)); 

        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(container, {
                scale: 2,
                useCORS: true,
                width: container.scrollWidth,
                height: container.scrollHeight,
                windowWidth: container.scrollWidth,
                windowHeight: container.scrollHeight,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
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
            pdf.save(`Relatorio_Geral_SAPI_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Error generating report PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF do relatório.");
        } finally {
            root.unmount();
            document.body.removeChild(container);
            setIsGeneratingReportPdf(false);
        }
    };


    const renderContent = () => {
        if (selectedStudentForProfile) {
            return (
                <StudentProfile
                    student={selectedStudentForProfile}
                    onBack={() => setSelectedStudentForProfile(null)}
                    userRole={user.role}
                    onSave={handleSaveStudent as (student: Student) => void}
                />
            );
        }

        if (activeView === 'enrollment') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
                        </svg>
                        <span>Formulário de Matrícula</span>
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <fieldset className="space-y-4">
                            <legend className="text-lg font-semibold text-gray-700">Dados Pessoais do Aluno</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                               <FormField name="name" label="Nome Completo" required>
                                    <FormInput type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
                                </FormField>
                                 <FormField name="dob" label="Data de Nascimento" required>
                                    <FormInput type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} required />
                                </FormField>
                                <FormField name="cpf" label="CPF do Aluno (Opcional)">
                                    <FormInput type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" />
                                </FormField>
                                <FormField name="gender" label="Gênero" required>
                                    <FormSelect name="gender" id="gender" value={formData.gender} onChange={handleChange} required>
                                        <option>Masculino</option>
                                        <option>Feminino</option>
                                    </FormSelect>
                                </FormField>
                                 <FormField name="address" label="Endereço">
                                    <FormInput type="text" name="address" id="address" value={formData.address} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - Estado" />
                                </FormField>
                            </div>
                        </fieldset>
                        <ParentFormField parentType="mother" label="Dados da Mãe" formData={formData} handleChange={handleChange} />
                        <ParentFormField parentType="father" label="Dados do Pai" formData={formData} handleChange={handleChange} />
                         <fieldset className="space-y-4 border-t pt-6">
                            <legend className="text-lg font-semibold text-gray-700">Dados da Matrícula e Responsável</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormField name="guardianName" label="Nome do Responsável Principal" required>
                                    <FormInput type="text" name="guardianName" id="guardianName" value={formData.guardianName} onChange={handleChange} required />
                                </FormField>
                                 <FormField name="guardianPhone" label="Telefone do Responsável" required>
                                    <FormInput type="tel" name="guardianPhone" id="guardianPhone" value={formData.guardianPhone} onChange={handleChange} required />
                                </FormField>
                                <FormField name="classId" label="Turma" required>
                                    <FormSelect name="classId" id="classId" value={formData.classId} onChange={handleChange} required>
                                        <option value={0} disabled>Selecione uma turma</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </FormSelect>
                                </FormField>
                                 <FormField name="shift" label="Turno" required>
                                    <FormSelect name="shift" id="shift" value={formData.shift} onChange={handleChange} required>
                                        <option>Manhã</option>
                                        <option>Tarde</option>
                                    </FormSelect>
                                </FormField>
                                 <FormField name="startYear" label="Ano de Início" required>
                                    <FormInput type="number" name="startYear" id="startYear" value={formData.startYear} onChange={handleChange} required />
                                </FormField>
                             </div>
                         </fieldset>
                         <fieldset className="space-y-4 border-t pt-6">
                            <legend className="text-lg font-semibold text-gray-700">Informações Adicionais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <FormField name="medicalNotes" label="Observações Médicas">
                                    <FormTextArea name="medicalNotes" id="medicalNotes" value={formData.medicalNotes} onChange={handleChange} placeholder="Alergias, condições pré-existentes, etc." />
                                </FormField>
                                <FormField name="foodRestrictions" label="Restrições Alimentares">
                                    <FormTextArea name="foodRestrictions" id="foodRestrictions" value={formData.foodRestrictions} onChange={handleChange} />
                                </FormField>
                            </div>
                            <FormField name="schoolHistory" label="Histórico Escolar Anterior">
                                <FormTextArea name="schoolHistory" id="schoolHistory" value={formData.schoolHistory} onChange={handleChange} />
                            </FormField>
                            <FormField name="specialNeeds" label="Necessidades Especiais / Observações Relevantes">
                                <FormTextArea name="specialNeeds" id="specialNeeds" value={formData.specialNeeds} onChange={handleChange} placeholder="Diagnósticos, acompanhamentos (fono, psico), etc." />
                            </FormField>
                         </fieldset>
                         <div className="flex justify-end items-center space-x-4 pt-6">
                             <button
                                type="button"
                                onClick={() => {
                                    const resetState = {...INITIAL_FORM_STATE, classId: classes.length > 0 ? classes[0].id : 0};
                                    setFormData(resetState);
                                }}
                                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-base transition-colors"
                            >
                                Limpar Formulário
                            </button>
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base transition-colors">
                                Salvar Matrícula
                            </button>
                        </div>
                    </form>
                </div>
            );
        }

        if (activeView === 'students') {
            return (
                 <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6 flex items-center space-x-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>Alunos Matriculados</span>
                    </h3>
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput 
                            type="text" 
                            placeholder="Pesquisar aluno pelo nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="md:col-span-2"
                        />
                        <div className='w-full'>
                            <FormSelect
                                id="yearFilter"
                                name="yearFilter"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            >
                                <option value="all">Todos os Anos Letivos</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </FormSelect>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nome do Aluno</th>
                                    <th scope="col" className="px-6 py-3">Turma</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{student.name}</th>
                                        <td className="px-6 py-4">{classes.find(c => c.id === student.classId)?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-4">
                                            <button
                                                onClick={() => setSelectedStudentForProfile(student)}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                Ver/Editar
                                            </button>
                                            <button
                                                onClick={() => handleRematricula(student)}
                                                className="font-medium text-green-600 hover:underline"
                                                title={`Rematricular ${student.name} para ${new Date().getFullYear()}`}
                                            >
                                                Rematricular
                                            </button>
                                            <button 
                                                onClick={() => handleGeneratePdf(student)}
                                                disabled={!!generatingPdfId}
                                                title="Gerar Ficha PDF"
                                                className="font-medium text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                                            >
                                                {generatingPdfId === student.id ? '...' : 'PDF'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="font-medium text-red-600 hover:underline"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredStudents.length === 0 && <p className="text-center text-gray-500 py-6">Nenhum aluno encontrado.</p>}
                    </div>
                </div>
            );
        }
        
        if (activeView === 'classes') {
            if (selectedClassIdForStudentList !== null) {
                const selectedClass = classes.find(c => c.id === selectedClassIdForStudentList);
                const studentsInClass = students.filter(s => s.classId === selectedClassIdForStudentList && s.status === 'active');
                const teacher = users.find(u => u.id === selectedClass?.teacherId);
        
                return (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-4 border-b border-gray-200 pb-4 mb-6">
                            <button
                                onClick={() => setSelectedClassIdForStudentList(null)}
                                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                                aria-label="Voltar para a lista de turmas"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-800">{selectedClass?.name}</h3>
                                <p className="text-gray-600">{studentsInClass.length} aluno(s) na turma | Professor(a): {teacher?.name || 'N/A'}</p>
                            </div>
                        </div>
                        
                        {studentsInClass.length > 0 ? (
                            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {studentsInClass.map(student => (
                                    <li
                                        key={student.id}
                                        onClick={() => setSelectedStudentForProfile(student)}
                                        className="bg-gray-50 p-3 rounded-md flex items-center space-x-4 border border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{student.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Data de Nasc.: {new Date(student.dob + 'T00:00:00').toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">Nenhum aluno matriculado nesta turma.</p>
                            </div>
                        )}
                    </div>
                );
            }

            return (
                 <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-3">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                           </svg>
                           <span>Gerenciamento de Turmas</span>
                        </h3>
                        <button 
                            onClick={handleAddNewClass}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold flex items-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>Nova Turma</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {classes.map(cls => {
                            const teacherName = users.find(u => u.id === cls.teacherId)?.name || 'N/A';
                            const studentCount = students.filter(s => s.classId === cls.id && s.status === 'active').length;
                            return (
                                <div 
                                    key={cls.id} 
                                    onClick={() => setSelectedClassIdForStudentList(cls.id)}
                                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                                >
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">{cls.name}</p>
                                        <p className="text-sm text-gray-600">Professor(a): {teacherName}</p>
                                        <p className="text-sm text-gray-600">Alunos: {studentCount}</p>
                                    </div>
                                    <div className="space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleEditClass(cls)} className="text-sm font-semibold text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-100 transition-colors">Editar</button>
                                        <button onClick={() => handleDeleteClassWrapper(cls)} className="text-sm font-semibold text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-100 transition-colors">Excluir</button>
                                    </div>
                                </div>
                            );
                        })}
                        {classes.length === 0 && (
                            <p className="text-center text-gray-500 py-6">Nenhuma turma cadastrada.</p>
                        )}
                    </div>
                </div>
            );
        }

        if(activeView === 'reports') {
            const StatCard: React.FC<{ title: string, value: number, children: React.ReactNode }> = ({ title, value, children }) => (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center space-x-4">
                    <div className="p-3 bg-white rounded-full">
                        {children}
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{value}</p>
                        <p className="text-sm text-gray-600">{title}</p>
                    </div>
                </div>
            );
            
            const ReportTable: React.FC<{title: string, students: Student[], dataExtractor: (s: Student) => string | undefined}> = ({title, students: studentList, dataExtractor}) => (
                <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
                    {studentList.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                            <table className="w-full text-sm text-left text-gray-600">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2">Nome</th>
                                        <th scope="col" className="px-4 py-2">Turma</th>
                                        <th scope="col" className="px-4 py-2">Observação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.map(s => (
                                        <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900">{s.name}</td>
                                            <td className="px-4 py-2">{classes.find(c => c.id === s.classId)?.name || 'N/A'}</td>
                                            <td className="px-4 py-2 whitespace-pre-wrap">{dataExtractor(s)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">Nenhum aluno encontrado nesta categoria.</p>
                    )}
                </div>
            );

            return (
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-3">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                           </svg>
                           <span>Relatório Geral da Escola</span>
                        </h3>
                         <button
                            onClick={handleGenerateGeneralReportPdf}
                            disabled={isGeneratingReportPdf}
                            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 flex items-center space-x-2 transition-colors disabled:bg-teal-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v3h6v-3z" clipRule="evenodd" /></svg>
                            <span>{isGeneratingReportPdf ? 'Gerando...' : 'Gerar PDF'}</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total de Alunos Ativos" value={reportData.stats.total}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </StatCard>
                         <StatCard title="Meninos" value={reportData.stats.boys}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                         </StatCard>
                        <StatCard title="Meninas" value={reportData.stats.girls}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </StatCard>
                        <StatCard title="Alunos Atípicos" value={reportData.stats.atypical}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </StatCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ReportTable 
                            title="Alunos Atípicos (com Necessidades Específicas)"
                            students={reportData.atypicalStudents}
                            dataExtractor={(s) => s.specialNeeds}
                        />
                         <ReportTable 
                            title="Alunos com Alergias/Restrições"
                            students={reportData.studentsWithAllergies}
                            dataExtractor={(s) => `${s.medicalNotes || ''} ${s.foodRestrictions || ''}`.trim()}
                        />
                    </div>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Painel do Diretor</h2>
            <div className="flex flex-col md:flex-row md:space-x-8">
                 <aside className="md:w-64 flex-shrink-0 mb-8 md:mb-0">
                    <nav className="space-y-2">
                        <MenuButton label="Matrícula" view="enrollment" activeView={activeView} onClick={() => setActiveView('enrollment')}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
                           </svg>
                        </MenuButton>
                        <MenuButton label="Alunos" view="students" activeView={activeView} onClick={() => setActiveView('students')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </MenuButton>
                         <MenuButton label="Turmas" view="classes" activeView={activeView} onClick={() => {
                             setActiveView('classes');
                             setSelectedClassIdForStudentList(null);
                         }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                           </svg>
                        </MenuButton>
                        <MenuButton label="Relatório Geral" view="reports" activeView={activeView} onClick={() => setActiveView('reports')}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                           </svg>
                        </MenuButton>
                    </nav>
                </aside>

                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
             {isClassFormOpen && (
                <ClassForm
                    classToEdit={classToEdit}
                    teachers={users.filter(u => u.role === Role.Professor)}
                    onSave={handleSaveClassWrapper}
                    onCancel={() => {
                        setIsClassFormOpen(false);
                        setClassToEdit(null);
                    }}
                />
            )}
        </div>
    );
};

export default DirectorDashboard;