export enum Role {
  AdminMaster = 'Admin Master',
  Diretor = 'Diretor',
  Coordenador = 'Coordenador',
  Professor = 'Professor',
  Psicopedagogo = 'Psicopedagogo',
  Responsavel = 'Responsável',
}

export interface User {
  id: number;
  name: string;
  login: string; // Nome de usuário para login
  email?: string; // E-mail, obrigatório apenas para professores
  role: string;
  password?: string; // Senha do usuário
  classId?: number;
  studentId?: number; // ID do aluno associado (para o perfil Responsável)
}

export enum EvaluationLevel {
  NaoObservado = 'Não observado',
  EmDesenvolvimento = 'Em desenvolvimento',
  Atingido = 'Atingido',
  AtingidoComAutonomia = 'Atingido com autonomia',
}

export type DevelopmentAreaKeys = 'motor' | 'cognitive' | 'language' | 'social' | 'autonomy';

export type SkillEvaluation = Record<string, EvaluationLevel>;

export type DevelopmentEvaluation = {
  [key in DevelopmentAreaKeys]: SkillEvaluation;
};

export interface EvaluationPeriod {
  period: string; // "1º Bimestre 2024", "2º Semestre 2024" etc.
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  evaluations: DevelopmentEvaluation;
  teacherNotes?: string;
  psychoNotes?: string;
  descriptiveReport?: string; // Novo campo para o relatório manuscrito
  attachments?: File[];
}

export interface AgendaEntry {
  date: string; // YYYY-MM-DD
  meals: string;
  activities: string;
  observations: string;
  messages: string;
  importantNotice?: boolean;
}

export interface ParentInfo {
  name: string;
  isAlive: boolean;
  cpf?: string;
  voterId?: string; // Título de Eleitor - Número
  voterZone?: string; // Título de Eleitor - Zona
  voterSection?: string; // Título de Eleitor - Seção
  nationality?: string;
  birthplace?: string; // Naturalidade
}

export interface Student {
  id: number;
  name: string;
  cpf?: string;
  dob: string;
  gender?: 'Masculino' | 'Feminino';
  motherInfo?: ParentInfo;
  fatherInfo?: ParentInfo;
  address?: string;
  startYear?: number;
  classId: number;
  shift: 'Manhã' | 'Tarde';
  status: 'active' | 'inactive';
  guardians: { name: string; phone: string }[];
  medicalNotes?: string;
  foodRestrictions?: string;
  schoolHistory?: string;
  specialNeeds?: string; // Novo campo para necessidades especiais
  evaluations: EvaluationPeriod[];
  agenda?: AgendaEntry[];
}

export interface Class {
  id: number;
  name: string;
  teacherId: number;
}

export interface Notice {
  id: number;
  content: string;
  senderId: number;
  recipientId: number | 'all';
  timestamp: string;
  readBy: number[];
}

export interface ScheduleEntry {
  id: number;
  dayOfWeek: 'Segunda-feira' | 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  subject: string;
  classId: number;
}

export enum AttendanceStatus {
  Presente = 'Presente',
  Ausente = 'Ausente',
  FaltaJustificada = 'Falta Justificada',
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}