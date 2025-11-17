// Populated mock data file
import { User, Class, Student, EvaluationLevel, EvaluationPeriod, DevelopmentAreaKeys, ScheduleEntry, AttendanceRecord, AttendanceStatus } from '../types';
import { DEVELOPMENT_AREAS } from '../constants';

// Helper to create a default evaluation structure
export const createDefaultEvaluation = (): EvaluationPeriod => {
    const evaluations = Object.keys(DEVELOPMENT_AREAS).reduce((acc, areaKey) => {
        const key = areaKey as DevelopmentAreaKeys;
        const skills = DEVELOPMENT_AREAS[key].skills;
        const skillEvals = Object.keys(skills).reduce((skillAcc, skillKey) => {
            // Initialize all as "Não observado" for new students
            skillAcc[skillKey] = EvaluationLevel.NaoObservado;
            return skillAcc;
        }, {} as Record<string, EvaluationLevel>);
        acc[key] = skillEvals;
        return acc;
    }, {} as Record<DevelopmentAreaKeys, Record<string, EvaluationLevel>>);

    return {
        period: '1º Bimestre 2024',
        evaluations: evaluations,
        teacherNotes: '',
        psychoNotes: '',
        descriptiveReport: '',
    };
};


export const USERS: User[] = [
  { id: 1, name: 'Ana Silva - Admin', login: 'admin', email: 'admin@escola.com', role: 'Admin Master', password: 'senha123' },
  { id: 2, name: 'Carlos Souza - Coordenador', login: 'coordenador', email: 'coordenador@escola.com', role: 'Coordenador', password: 'senha123' },
  { id: 3, name: 'Beatriz Costa - Professora', login: 'beatriz.costa', email: 'beatriz.costa@escola.com', role: 'Professor', classId: 1, password: 'senha123' },
  { id: 4, name: 'Daniel Martins - Professor', login: 'daniel.martins', email: 'daniel.martins@escola.com', role: 'Professor', classId: 2, password: 'senha123' },
  { id: 5, name: 'Fernanda Lima - Psicopedagoga', login: 'psico', email: 'psico@escola.com', role: 'Psicopedagogo', password: 'senha123' },
  { id: 6, name: 'Marcos Pereira - Professor', login: 'marcos.pereira', email: 'marcos.pereira@escola.com', role: 'Professor', classId: 3, password: 'senha123' },
  { id: 7, name: 'Roberto Lima - Diretor', login: 'diretor', role: 'Diretor', password: 'senha123' },

];

export const CLASSES: Class[] = [
  { id: 1, name: 'Maternal I', teacherId: 3 },
  { id: 2, name: 'Maternal II', teacherId: 4 },
  { id: 3, name: 'Jardim I', teacherId: 6 },
];

// Helper to create a random evaluation for initial mock data
const createRandomEvaluation = (): EvaluationPeriod => {
    const evaluations = Object.keys(DEVELOPMENT_AREAS).reduce((acc, areaKey) => {
        const key = areaKey as DevelopmentAreaKeys;
        const skills = DEVELOPMENT_AREAS[key].skills;
        const skillEvals = Object.keys(skills).reduce((skillAcc, skillKey) => {
            // Randomly assign a level for variety
            const levels = Object.values(EvaluationLevel);
            const randomLevel = levels[Math.floor(Math.random() * levels.length)];
            skillAcc[skillKey] = randomLevel;
            return skillAcc;
        }, {} as Record<string, EvaluationLevel>);
        acc[key] = skillEvals;
        return acc;
    }, {} as Record<DevelopmentAreaKeys, Record<string, EvaluationLevel>>);

    return {
        period: '1º Bimestre 2024',
        evaluations: evaluations,
        teacherNotes: 'O aluno demonstra bom progresso, mas precisa de mais incentivo para interagir com os colegas durante as atividades em grupo.',
        psychoNotes: Math.random() > 0.7 ? 'Acompanhamento recomendado para questões de socialização. Apresenta comportamento tímido.' : undefined,
        descriptiveReport: 'O aluno tem se mostrado bastante participativo nas rodas de conversa, compartilhando suas experiências de casa. Apresenta bom desenvolvimento na coordenação motora ampla, correndo e pulando com destreza. Na coordenação fina, ainda está desenvolvendo o movimento de pinça e o uso da tesoura. Interage bem com os colegas, dividindo brinquedos e participando das brincadeiras coletivas.',
    };
};


export const STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Lucas Pereira',
    cpf: '111.222.333-44',
    dob: '2021-03-15',
    gender: 'Masculino',
    motherInfo: {
        name: 'Mariana Pereira',
        isAlive: true,
        cpf: '987.654.321-00',
        voterId: '123456789012',
        voterZone: '053',
        voterSection: '0123',
        nationality: 'Brasileira',
        birthplace: 'São Paulo/SP'
    },
    fatherInfo: {
        name: 'Ricardo Pereira',
        isAlive: true,
        cpf: '123.456.789-00',
        voterId: '210987654321',
        voterZone: '053',
        voterSection: '0456',
        nationality: 'Brasileiro',
        birthplace: 'Rio de Janeiro/RJ'
    },
    address: 'Rua das Flores, 123, São Paulo, SP',
    startYear: 2024,
    classId: 1,
    shift: 'Manhã',
    status: 'active',
    guardians: [{ name: 'Ricardo Pereira', phone: '11 98765-4321' }],
    medicalNotes: 'Alergia a amendoim.',
    foodRestrictions: 'Não pode comer amendoim e derivados.',
    schoolHistory: 'Primeiro ano na escola.',
    evaluations: [createRandomEvaluation()],
    agenda: [
        {
          date: new Date().toISOString().split('T')[0], // Today's date
          meals: 'Comeu bem no almoço. Aceitou a fruta no lanche da tarde.',
          activities: 'Participou da roda de música e da pintura com guache no parque.',
          observations: 'Estava um pouco sonolento após o almoço, mas se animou para a brincadeira no pátio. Interagiu bem com os colegas.',
          messages: 'Por favor, enviar uma troca de roupa extra amanhã.',
          importantNotice: true,
        },
        {
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday's date
          meals: 'Comeu pouco no almoço.',
          activities: 'Brincou no cantinho da leitura e com blocos de montar.',
          observations: 'Estava mais quieto que o normal.',
          messages: 'Nenhum recado.',
        }
    ]
  },
  {
    id: 2,
    name: 'Júlia Santos',
    cpf: '222.333.444-55',
    dob: '2021-05-20',
    gender: 'Feminino',
    motherInfo: {
        name: 'Beatriz Santos',
        isAlive: true,
        cpf: '567.654.321-00',
        voterId: '987654321098',
        nationality: 'Brasileira',
        birthplace: 'Salvador/BA'
    },
    address: 'Avenida Principal, 456, São Paulo, SP',
    startYear: 2024,
    classId: 1,
    shift: 'Tarde',
    status: 'active',
    guardians: [{ name: 'Mariana Santos', phone: '11 91234-5678' }],
    medicalNotes: 'Nenhuma observação.',
    evaluations: [createRandomEvaluation()],
  },
  {
    id: 3,
    name: 'Mateus Oliveira',
    cpf: '333.444.555-66',
    dob: '2020-11-10',
    gender: 'Masculino',
    classId: 2,
    shift: 'Manhã',
    status: 'active',
    guardians: [{ name: 'Fernanda Oliveira', phone: '11 99876-5432' }],
    evaluations: [createRandomEvaluation()],
  },
  {
    id: 4,
    name: 'Sofia Almeida',
    cpf: '444.555.666-77',
    dob: '2020-09-01',
    gender: 'Feminino',
    classId: 2,
    shift: 'Tarde',
    status: 'active',
    guardians: [{ name: 'Juliana Almeida', phone: '11 8765-1234' }],
    medicalNotes: 'Asma. Levar bombinha na mochila.',
    specialNeeds: 'Transtorno do Espectro Autista (TEA) - Nível 1 de suporte. Reage bem a rotinas estruturadas e previsibilidade. Utilizar comunicação visual como apoio.',
    evaluations: [createRandomEvaluation()],
  },
  {
    id: 5,
    name: 'Davi Ribeiro',
    cpf: '555.666.777-88',
    dob: '2019-07-25',
    gender: 'Masculino',
    classId: 3,
    shift: 'Manhã',
    status: 'active',
    guardians: [{ name: 'Bruno Ribeiro', phone: '11 91234-8765' }],
    evaluations: [createRandomEvaluation()],
  },
  {
    id: 6,
    name: 'Laura Costa',
    cpf: '666.777.888-99',
    dob: '2019-10-05',
    gender: 'Feminino',
    classId: 3,
    shift: 'Tarde',
    status: 'active',
    guardians: [{ name: 'Camila Costa', phone: '11 95678-4321' }],
    evaluations: [createRandomEvaluation()],
  },
  {
    id: 7,
    name: 'Pedro Gomes',
    cpf: '777.888.999-00',
    dob: '2021-01-20',
    gender: 'Masculino',
    classId: 99, // Inactive, no valid class
    shift: 'Manhã',
    status: 'inactive',
    guardians: [{ name: 'Ana Gomes', phone: '11 9888-7777' }],
    evaluations: [createDefaultEvaluation()],
  },
  {
    id: 8,
    name: 'Clara Dias',
    cpf: '888.999.000-11',
    dob: '2020-02-25',
    gender: 'Feminino',
    classId: 99, // Inactive, no valid class
    shift: 'Tarde',
    status: 'inactive',
    guardians: [{ name: 'Sérgio Dias', phone: '11 97777-6666' }],
    medicalNotes: 'Intolerância à lactose.',
    evaluations: [createDefaultEvaluation()],
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const ATTENDANCE: AttendanceRecord[] = [
  // Lucas Pereira (studentId: 1, classId: 1)
  { id: 1, studentId: 1, date: formatDate(twoDaysAgo), status: AttendanceStatus.Presente },
  { id: 2, studentId: 1, date: formatDate(yesterday), status: AttendanceStatus.Presente },
  { id: 3, studentId: 1, date: '2024-05-15', status: AttendanceStatus.Ausente },

  // Júlia Santos (studentId: 2, classId: 1)
  { id: 4, studentId: 2, date: formatDate(twoDaysAgo), status: AttendanceStatus.Presente },
  { id: 5, studentId: 2, date: formatDate(yesterday), status: AttendanceStatus.Ausente },
  
  // Mateus Oliveira (studentId: 3, classId: 2)
  { id: 7, studentId: 3, date: formatDate(twoDaysAgo), status: AttendanceStatus.Presente },
  { id: 8, studentId: 3, date: formatDate(yesterday), status: AttendanceStatus.Presente },
];

export const SCHEDULE: ScheduleEntry[] = [
    // Turma Maternal I (classId: 1)
    { id: 1, classId: 1, dayOfWeek: 'Segunda-feira', startTime: '08:00', endTime: '08:30', subject: 'Acolhida e Roda de Conversa' },
    { id: 2, classId: 1, dayOfWeek: 'Segunda-feira', startTime: '08:30', endTime: '09:30', subject: 'Parque' },
    { id: 3, classId: 1, dayOfWeek: 'Segunda-feira', startTime: '09:30', endTime: '10:00', subject: 'Lanche' },
    { id: 4, classId: 1, dayOfWeek: 'Segunda-feira', startTime: '10:00', endTime: '11:00', subject: 'Atividade de Artes' },
    { id: 5, classId: 1, dayOfWeek: 'Terça-feira', startTime: '08:00', endTime: '08:30', subject: 'Acolhida e Músicas' },
    { id: 6, classId: 1, dayOfWeek: 'Terça-feira', startTime: '08:30', endTime: '09:30', subject: 'Brinquedos Pedagógicos' },
    { id: 10, classId: 1, dayOfWeek: 'Quarta-feira', startTime: '08:00', endTime: '09:00', subject: 'Contação de Histórias' },
    { id: 11, classId: 1, dayOfWeek: 'Quinta-feira', startTime: '08:00', endTime: '09:00', subject: 'Psicomotricidade' },
    { id: 12, classId: 1, dayOfWeek: 'Sexta-feira', startTime: '08:00', endTime: '09:00', subject: 'Dia do Brinquedo' },

    // Turma Maternal II (classId: 2)
    { id: 7, classId: 2, dayOfWeek: 'Segunda-feira', startTime: '08:00', endTime: '08:30', subject: 'Chegada e Roda de Novidades' },
    { id: 8, classId: 2, dayOfWeek: 'Segunda-feira', startTime: '08:30', endTime: '09:30', subject: 'Atividade Psicomotora' },
    { id: 9, classId: 2, dayOfWeek: 'Terça-feira', startTime: '08:00', endTime: '09:00', subject: 'Aula de Música' },

    // Turma Jardim I (classId: 3)
    { id: 13, classId: 3, dayOfWeek: 'Segunda-feira', startTime: '08:00', endTime: '09:00', subject: 'Projeto Leitura' },
    { id: 14, classId: 3, dayOfWeek: 'Terça-feira', startTime: '08:00', endTime: '09:00', subject: 'Experiências Científicas' },
];