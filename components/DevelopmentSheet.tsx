import React from 'react';
import { EvaluationPeriod, EvaluationLevel, DevelopmentAreaKeys } from '../types';
import { DEVELOPMENT_AREAS, EVALUATION_LEVELS, EVALUATION_LEVEL_COLORS } from '../constants';

interface DevelopmentSheetProps {
    evaluationData: EvaluationPeriod;
    setEvaluationData: React.Dispatch<React.SetStateAction<EvaluationPeriod>>;
    isEditable: boolean;
}

const DevelopmentSheet: React.FC<DevelopmentSheetProps> = ({ evaluationData, setEvaluationData, isEditable }) => {
    
    const handleEvaluationChange = (area: DevelopmentAreaKeys, skill: string, level: EvaluationLevel) => {
        if (!isEditable) return;

        setEvaluationData(prevData => {
            const newEvaluations = { ...prevData.evaluations };
            newEvaluations[area] = { ...newEvaluations[area], [skill]: level };
            return { ...prevData, evaluations: newEvaluations };
        });
    };

    return (
        <div className="space-y-6">
            {Object.entries(DEVELOPMENT_AREAS).map(([areaKey, areaData]) => (
                <div key={areaKey} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">{areaData.title}</h3>
                    <div className="space-y-4">
                        {Object.entries(areaData.skills).map(([skillKey, skillLabel]) => (
                            <div key={skillKey} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                                <label className="md:col-span-2 text-gray-600 font-medium">{skillLabel}</label>
                                <div className="md:col-span-4 flex flex-wrap gap-2">
                                    {EVALUATION_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleEvaluationChange(areaKey as DevelopmentAreaKeys, skillKey, level)}
                                            className={`
                                                px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200
                                                ${evaluationData.evaluations[areaKey as DevelopmentAreaKeys]?.[skillKey] === level
                                                    ? `${EVALUATION_LEVEL_COLORS[level]} ring-2 ring-offset-1 ${EVALUATION_LEVEL_COLORS[level].replace('bg-', 'ring-').replace('-200', '-400')}`
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                                                ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}
                                            `}
                                            disabled={!isEditable}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Observações da Professora</h3>
                 <textarea 
                    className="w-full p-2 border rounded-md" 
                    rows={5}
                    value={evaluationData.teacherNotes || ''}
                    readOnly={!isEditable}
                    onChange={(e) => {
                        if (isEditable) {
                           setEvaluationData(prev => ({...prev, teacherNotes: e.target.value}));
                        }
                    }}
                 />
            </div>
        </div>
    );
};

export default DevelopmentSheet;