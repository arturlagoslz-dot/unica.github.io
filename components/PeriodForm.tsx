import React, { useState, useMemo, useEffect } from 'react';
import { EvaluationPeriod } from '../types';

interface NewPeriodDetails {
  periodName: string;
  startDate?: string;
  endDate?: string;
}

interface PeriodFormProps {
  periodToEdit?: EvaluationPeriod | null;
  allPeriods: EvaluationPeriod[];
  onSave: (details: NewPeriodDetails, originalPeriodName?: string) => void;
  onCancel: () => void;
}

const periodTypes = ['Bimestre', 'Trimestre', 'Semestre'];
const currentYear = new Date().getFullYear();

const getNextPeriodDetails = (latestPeriod?: string) => {
    if (!latestPeriod) {
        return { identifier: '1º', periodType: periodTypes[0], year: currentYear };
    }
    const match = latestPeriod.match(/(\d+)(?:º|ª)?\s(Bimestre|Trimestre|Semestre)\s(\d{4})/);
    if (!match) {
        return { identifier: '1º', periodType: periodTypes[0], year: currentYear };
    }
    const [, id, type, yearStr] = match;
    let nextId = parseInt(id, 10) + 1;
    let nextYear = parseInt(yearStr, 10);
    const typeLimits: Record<string, number> = { 'Bimestre': 4, 'Trimestre': 3, 'Semestre': 2 };
    if (typeLimits[type] && nextId > typeLimits[type]) {
        nextId = 1;
        nextYear += 1;
    }
    return { identifier: `${nextId}º`, periodType: type as 'Bimestre' | 'Trimestre' | 'Semestre', year: nextYear };
};

const parsePeriodName = (periodName: string) => {
    const match = periodName.match(/^(.+?)\s(Bimestre|Trimestre|Semestre)\s(\d{4})$/);
    if (!match) return null;
    const [, identifier, periodType, year] = match;
    return { identifier, periodType, year: parseInt(year, 10) };
};

const PeriodForm: React.FC<PeriodFormProps> = ({ periodToEdit, allPeriods, onSave, onCancel }) => {
  const [identifier, setIdentifier] = useState('');
  const [periodType, setPeriodType] = useState(periodTypes[0]);
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (periodToEdit) {
        const parsed = parsePeriodName(periodToEdit.period);
        if (parsed) {
            setIdentifier(parsed.identifier);
            setPeriodType(parsed.periodType);
            setYear(parsed.year);
        } else {
            // Fallback for non-standard names
            setIdentifier(periodToEdit.period);
            setPeriodType('');
            setYear(currentYear);
        }
        setStartDate(periodToEdit.startDate || '');
        setEndDate(periodToEdit.endDate || '');
    } else {
        const latestPeriod = allPeriods.length > 0 ? allPeriods[allPeriods.length - 1].period : undefined;
        const details = getNextPeriodDetails(latestPeriod);
        setIdentifier(details.identifier);
        setPeriodType(details.periodType);
        setYear(details.year);
        setStartDate('');
        setEndDate('');
    }
  }, [periodToEdit, allPeriods]);

  const finalPeriodName = useMemo(() => {
      if (!identifier || !periodType || !year) return identifier; // Fallback for custom name
      return `${identifier.trim()} ${periodType} ${year}`;
  }, [identifier, periodType, year]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalPeriodName) {
        alert('O nome do período não pode estar vazio.');
        return;
    }
    const existingNames = allPeriods.map(p => p.period);
    const originalName = periodToEdit?.period;
    if (finalPeriodName !== originalName && existingNames.includes(finalPeriodName)) {
        alert("Já existe um período de avaliação com este nome.");
        return;
    }
    onSave({ periodName: finalPeriodName, startDate, endDate }, originalName);
  };

  const isEditing = !!periodToEdit;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? 'Editar Período' : 'Criar Novo Período de Avaliação'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Identificador</label>
              <input 
                type="text" 
                name="identifier" 
                id="identifier" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
                placeholder="Ex: 1º, Anual"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="periodType" className="block text-sm font-medium text-gray-700">Tipo</label>
              <select 
                name="periodType" 
                id="periodType" 
                value={periodType} 
                onChange={(e) => setPeriodType(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {periodTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Ano</label>
            <input 
              type="number" 
              name="year" 
              id="year" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início (Opcional)</label>
                <input type="date" name="startDate" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim (Opcional)</label>
                <input type="date" name="endDate" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-600">
                <strong>Nome do Período:</strong>
                <span className="ml-2 font-mono bg-gray-100 p-1 rounded">{finalPeriodName || '...'}</span>
            </p>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">{isEditing ? 'Salvar Alterações' : 'Criar Período'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeriodForm;