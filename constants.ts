
import { EvaluationLevel, DevelopmentAreaKeys } from './types';

export const EVALUATION_LEVELS = Object.values(EvaluationLevel);

export const DEVELOPMENT_AREAS: Record<DevelopmentAreaKeys, { title: string; skills: Record<string, string> }> = {
  motor: {
    title: 'Desenvolvimento Motor',
    skills: {
      corre: 'Corre com segurança',
      pula: 'Pula com os dois pés',
      coordFina: 'Utiliza tesoura e realiza traços',
      equilibrio: 'Mantém o equilíbrio em um pé só',
    },
  },
  cognitive: {
    title: 'Desenvolvimento Cognitivo',
    skills: {
      cores: 'Reconhece cores primárias',
      numeros: 'Conta até 10',
      formas: 'Identifica formas geométricas básicas',
      instrucoes: 'Segue instruções simples',
      raciocinio: 'Resolve quebra-cabeças simples',
    },
  },
  language: {
    title: 'Linguagem e Comunicação',
    skills: {
      frases: 'Fala frases completas',
      historias: 'Entende e re-conta histórias curtas',
      perguntas: 'Faz perguntas sobre o que o cerca',
      vocabulario: 'Possui vocabulário crescente',
    },
  },
  social: {
    title: 'Socioemocional',
    skills: {
      interage: 'Interage com colegas e adultos',
      sentimentos: 'Expressa seus sentimentos',
      regras: 'Respeita regras e combinados',
      empatia: 'Demonstra empatia pelos colegas',
    },
  },
  autonomy: {
    title: 'Hábitos e Autonomia',
    skills: {
      alimenta: 'Alimenta-se sozinho',
      guarda: 'Guarda seus materiais após o uso',
      banheiro: 'Usa o banheiro com independência',
      veste: 'Veste-se com ajuda mínima',
    },
  },
};

export const EVALUATION_LEVEL_COLORS: Record<EvaluationLevel, string> = {
  [EvaluationLevel.NaoObservado]: 'bg-red-200 text-red-800',
  [EvaluationLevel.EmDesenvolvimento]: 'bg-yellow-200 text-yellow-800',
  [EvaluationLevel.Atingido]: 'bg-blue-200 text-blue-800',
  [EvaluationLevel.AtingidoComAutonomia]: 'bg-green-200 text-green-800',
};