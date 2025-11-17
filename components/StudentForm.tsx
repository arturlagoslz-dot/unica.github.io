import React, { useState, useEffect } from 'react';
import { Student, Class } from '../types';

interface StudentFormProps {
  studentToEdit: Student | null;
  onSave: (student: Omit<Student, 'id' | 'evaluations'> & { id?: number }) => void;
  onCancel: () => void;
  classes: Class[];
  defaultClassId?: number;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const StudentForm: React.FC<StudentFormProps> = ({ studentToEdit, onSave, onCancel, classes, defaultClassId }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    dob: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino',
    classId: 1,
    shift: 'Manhã' as 'Manhã' | 'Tarde',
    status: 'active' as 'active' | 'inactive',
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
    guardianName: '',
    guardianPhone: '',
    medicalNotes: '',
    foodRestrictions: '',
    schoolHistory: '',
    specialNeeds: '',
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        cpf: studentToEdit.cpf || '',
        dob: studentToEdit.dob,
        gender: studentToEdit.gender || 'Masculino',
        classId: studentToEdit.classId,
        shift: studentToEdit.shift,
        status: studentToEdit.status,
        motherName: studentToEdit.motherInfo?.name || '',
        motherIsAlive: studentToEdit.motherInfo?.isAlive ?? true,
        motherCpf: studentToEdit.motherInfo?.cpf || '',
        motherVoterId: studentToEdit.motherInfo?.voterId || '',
        motherVoterZone: studentToEdit.motherInfo?.voterZone || '',
        motherVoterSection: studentToEdit.motherInfo?.voterSection || '',
        motherNationality: studentToEdit.motherInfo?.nationality || 'Brasileira',
        motherBirthplace: studentToEdit.motherInfo?.birthplace || '',
        fatherName: studentToEdit.fatherInfo?.name || '',
        fatherIsAlive: studentToEdit.fatherInfo?.isAlive ?? true,
        fatherCpf: studentToEdit.fatherInfo?.cpf || '',
        fatherVoterId: studentToEdit.fatherInfo?.voterId || '',
        fatherVoterZone: studentToEdit.fatherInfo?.voterZone || '',
        fatherVoterSection: studentToEdit.fatherInfo?.voterSection || '',
        fatherNationality: studentToEdit.fatherInfo?.nationality || 'Brasileira',
        fatherBirthplace: studentToEdit.fatherInfo?.birthplace || '',
        address: studentToEdit.address || '',
        startYear: studentToEdit.startYear || new Date().getFullYear(),
        guardianName: studentToEdit.guardians[0]?.name || '',
        guardianPhone: studentToEdit.guardians[0]?.phone || '',
        medicalNotes: studentToEdit.medicalNotes || '',
        foodRestrictions: studentToEdit.foodRestrictions || '',
        schoolHistory: studentToEdit.schoolHistory || '',
        specialNeeds: studentToEdit.specialNeeds || '',
      });
    } else {
        setFormData({
            name: '',
            cpf: '',
            dob: '',
            gender: 'Masculino',
            classId: defaultClassId || classes[0]?.id || 1,
            shift: 'Manhã',
            status: 'active',
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
            guardianName: '',
            guardianPhone: '',
            medicalNotes: '',
            foodRestrictions: '',
            schoolHistory: '',
            specialNeeds: '',
        });
    }
  }, [studentToEdit, classes, defaultClassId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: name === 'classId' || name === 'startYear' ? parseInt(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob || !formData.guardianName || !formData.guardianPhone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    const studentData = {
      id: studentToEdit?.id,
      name: formData.name,
      cpf: formData.cpf,
      dob: formData.dob,
      gender: formData.gender,
      classId: formData.classId,
      shift: formData.shift,
      status: formData.status,
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
      guardians: [{ name: formData.guardianName, phone: formData.guardianPhone }],
      medicalNotes: formData.medicalNotes,
      foodRestrictions: formData.foodRestrictions,
      schoolHistory: formData.schoolHistory,
      specialNeeds: formData.specialNeeds,
    };
    onSave(studentData);
  };
  
  const ParentFormField: React.FC<{
    parentType: 'mother' | 'father';
    label: string;
    formData: any;
    handleChange: any;
  }> = ({ parentType, label, formData, handleChange }) => {
    const isAlive = formData[`${parentType}IsAlive`];
    const isDisabled = !isAlive;
    const nameKey = `${parentType}Name`;
    const isAliveKey = `${parentType}IsAlive`;
    const cpfKey = `${parentType}Cpf`;
    const voterIdKey = `${parentType}VoterId`;
    const voterZoneKey = `${parentType}VoterZone`;
    const voterSectionKey = `${parentType}VoterSection`;
    const nationalityKey = `${parentType}Nationality`;
    const birthplaceKey = `${parentType}Birthplace`;

    return (
      <fieldset className="border p-4 rounded-md mt-4">
        <legend className="text-lg font-semibold px-2">{label}</legend>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-2/3">
              <label htmlFor={nameKey} className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" name={nameKey} id={nameKey} value={formData[nameKey]} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" name={isAliveKey} id={isAliveKey} checked={isAlive} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor={isAliveKey} className="text-sm font-medium text-gray-700">Vivo(a)</label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={cpfKey} className="block text-sm font-medium text-gray-700">CPF</label>
              <input type="text" name={cpfKey} id={cpfKey} value={formData[cpfKey]} onChange={handleChange} disabled={isDisabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
            </div>
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Título de Eleitor</label>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label htmlFor={voterIdKey} className="block text-xs text-gray-500">Número</label>
                        <input type="text" name={voterIdKey} id={voterIdKey} value={formData[voterIdKey]} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor={voterZoneKey} className="block text-xs text-gray-500">Zona</label>
                        <input type="text" name={voterZoneKey} id={voterZoneKey} value={formData[voterZoneKey]} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                    <div>
                        <label htmlFor={voterSectionKey} className="block text-xs text-gray-500">Seção</label>
                        <input type="text" name={voterSectionKey} id={voterSectionKey} value={formData[voterSectionKey]} onChange={handleChange} disabled={isDisabled} className="w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                </div>
            </div>
            <div>
              <label htmlFor={nationalityKey} className="block text-sm font-medium text-gray-700">Nacionalidade</label>
              <select name={nationalityKey} id={nationalityKey} value={formData[nationalityKey]} onChange={handleChange} disabled={isDisabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 bg-white">
                  <option>Brasileira</option>
                  <option>Estrangeira</option>
              </select>
            </div>
            <div>
              <label htmlFor={birthplaceKey} className="block text-sm font-medium text-gray-700">Naturalidade (UF)</label>
              <select name={birthplaceKey} id={birthplaceKey} value={formData[birthplaceKey]} onChange={handleChange} disabled={isDisabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 bg-white">
                <option value="">Selecione o Estado</option>
                {BRAZILIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
          </div>
        </div>
      </fieldset>
    );
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{studentToEdit ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2">Dados do Aluno</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                    <input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gênero</label>
                        <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option>Masculino</option>
                            <option>Feminino</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            </div>
          </fieldset>
         
          <ParentFormField parentType="mother" label="Dados da Mãe" formData={formData} handleChange={handleChange} />
          <ParentFormField parentType="father" label="Dados do Pai" formData={formData} handleChange={handleChange} />

          <fieldset className="border p-4 rounded-md mt-4">
            <legend className="text-lg font-semibold px-2">Responsável e Matrícula</legend>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700">Nome do Responsável Principal</label>
                    <input type="text" name="guardianName" id="guardianName" value={formData.guardianName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                    <label htmlFor="guardianPhone" className="block text-sm font-medium text-gray-700">Telefone do Responsável</label>
                    <input type="tel" name="guardianPhone" id="guardianPhone" value={formData.guardianPhone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">Ano de Início</label>
                    <input type="number" name="startYear" id="startYear" value={formData.startYear} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Turma</label>
                    <select name="classId" id="classId" value={formData.classId} onChange={handleChange} disabled={!!defaultClassId} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                        <option value={0} disabled>Selecione uma turma</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="shift" className="block text-sm font-medium text-gray-700">Turno</label>
                    <select name="shift" id="shift" value={formData.shift} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option>Manhã</option>
                        <option>Tarde</option>
                    </select>
                    </div>
                    <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                    </div>
                </div>
            </div>
          </fieldset>
          
          <fieldset className="border p-4 rounded-md mt-4">
            <legend className="text-lg font-semibold px-2">Informações Adicionais</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700">Necessidades Especiais / Observações Relevantes</label>
                    <textarea name="specialNeeds" id="specialNeeds" value={formData.specialNeeds} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Diagnóstico de TEA, acompanhamento com fonoaudiólogo, etc."></textarea>
                </div>
                
                <div>
                    <label htmlFor="schoolHistory" className="block text-sm font-medium text-gray-700">Histórico Escolar Anterior</label>
                    <textarea name="schoolHistory" id="schoolHistory" value={formData.schoolHistory} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>

                <div>
                    <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700">Observações Médicas</label>
                    <textarea name="medicalNotes" id="medicalNotes" value={formData.medicalNotes} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                
                <div>
                    <label htmlFor="foodRestrictions" className="block text-sm font-medium text-gray-700">Restrições Alimentares</label>
                    <textarea name="foodRestrictions" id="foodRestrictions" value={formData.foodRestrictions} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
            </div>
          </fieldset>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;