import React, { useState, useCallback, createContext, useMemo, useEffect } from 'react';
import { User, Student, Class, Notice, ScheduleEntry, AttendanceRecord, AttendanceStatus } from './types';
import { USERS as initialUsers, STUDENTS as initialStudents, CLASSES as initialClasses, SCHEDULE as initialSchedule, ATTENDANCE as initialAttendance, createDefaultEvaluation } from './data/mockData';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// --- Helper function to get initial state from localStorage or fallback to mock data ---
const getInitialState = <T,>(key: string, fallback: T[]): T[] => {
    try {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : fallback;
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return fallback;
    }
};


// --- Auth Context ---
export const AuthContext = createContext<{
  user: User | null;
  logout: () => void;
} | null>(null);

// --- Data Context ---
export interface DataContextType {
    students: Student[];
    classes: Class[];
    users: User[];
    notices: Notice[];
    schedule: ScheduleEntry[];
    attendance: AttendanceRecord[];
    handleSaveStudent: (studentData: (Omit<Student, 'id' | 'evaluations'> & { id?: number }) | Student) => void;
    handleDeleteStudent: (studentId: number) => void;
    handleSaveUser: (userData: Omit<User, 'id'> & { id?: number }) => void;
    handleDeleteUser: (userId: number) => void;
    handleSaveClass: (classData: Omit<Class, 'id'> & { id?: number }) => void;
    handleDeleteClass: (classId: number) => void;
    handleSaveNotice: (noticeData: Omit<Notice, 'id' | 'timestamp' | 'readBy'>) => void;
    handleMarkNoticeAsRead: (noticeId: number) => void;
    handleSaveScheduleEntry: (entryData: Omit<ScheduleEntry, 'id'> & { id?: number }) => void;
    handleDeleteScheduleEntry: (entryId: number) => void;
    handleSaveAttendance: (classId: number, date: string, attendanceData: Map<number, { status: AttendanceStatus; notes?: string }>) => void;
    handleExportData: () => void;
    handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DataContext = createContext<DataContextType | null>(null);


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Centralized State, now initialized from localStorage
  const [users, setUsers] = useState<User[]>(() => getInitialState('sapi_users', initialUsers));
  const [classes, setClasses] = useState<Class[]>(() => getInitialState('sapi_classes', initialClasses));
  const [students, setStudents] = useState<Student[]>(() => getInitialState('sapi_students', initialStudents));
  const [notices, setNotices] = useState<Notice[]>(() => getInitialState('sapi_notices', []));
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => getInitialState('sapi_schedule', initialSchedule));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getInitialState('sapi_attendance', initialAttendance));

  // --- Effects to save state to localStorage on change ---
  useEffect(() => { localStorage.setItem('sapi_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('sapi_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('sapi_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('sapi_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('sapi_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('sapi_attendance', JSON.stringify(attendance)); }, [attendance]);


  const handleLogin = useCallback((login: string, password: string) => {
    // 1. Try to log in as a regular user (staff)
    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
      setCurrentUser(user);
      return;
    }

    // 2. If no user found, try to log in as a parent
    const student = students.find(s => {
        if (!s.cpf) return false;
        const cleanCpf = s.cpf.replace(/[^\d]/g, ''); // Remove formatting
        const cleanLogin = login.replace(/[^\d]/g, '');
        return cleanCpf === cleanLogin && cleanCpf.substring(0, 5) === password;
    });

    if (student) {
        // Create a temporary "virtual" user for the parent
        const parentUser: User = {
            id: 9000 + student.id, // Create a unique-ish ID to avoid clashes
            name: `Responsável por ${student.name}`,
            login: student.cpf!,
            role: 'Responsável',
            studentId: student.id,
        };
        setCurrentUser(parentUser);
        return;
    }

    // 3. If no login method succeeds
    alert('Login ou senha inválido!');
  }, [users, students]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  // --- Data Manipulation Handlers (Refactored to be more robust) ---
    const handleSaveStudent = useCallback((studentData: (Omit<Student, 'id' | 'evaluations'> & { id?: number }) | Student) => {
    setStudents(prevStudents => {
        // Case 1: An ID is explicitly provided. This is a direct update (e.g., from StudentProfile).
        if (studentData.id) {
            // If it's a full student object (from profile save), replace it
            if ('evaluations' in studentData) {
                return prevStudents.map(s => s.id === studentData.id ? studentData : s);
            } else {
                // It's a partial object from a form, merge it
                return prevStudents.map(s => s.id === studentData.id ? { ...s, ...studentData } as Student : s);
            }
        }

        // Case 2: No ID provided. This could be a new student OR an update via CPF (rematrícula).
        const cleanCpf = studentData.cpf?.replace(/[^\d]/g, '');
        if (cleanCpf && cleanCpf.length > 0) {
            const existingStudentByCpf = prevStudents.find(s => s.cpf && s.cpf.replace(/[^\d]/g, '') === cleanCpf);
            
            // Subcase 2a: Found an existing student with the same CPF. Update them.
            if (existingStudentByCpf) {
                const updatedStudent: Student = {
                    ...existingStudentByCpf, // Start with the existing student's data (preserves evaluations, etc.)
                    ...studentData,          // Overlay the new form data
                    id: existingStudentByCpf.id, // Ensure the ID is preserved
                };
                return prevStudents.map(s => s.id === existingStudentByCpf.id ? updatedStudent : s);
            }
        }

        // Subcase 2b: No existing student with this CPF, or no CPF provided. This is a new student.
        const newStudent: Student = {
            ...(studentData as Omit<Student, 'id' | 'evaluations'>),
            id: prevStudents.length > 0 ? Math.max(...prevStudents.map(s => s.id)) + 1 : 1,
            evaluations: [createDefaultEvaluation()],
        };
        return [...prevStudents, newStudent];
    });
  }, []);
  
  const handleDeleteStudent = useCallback((studentId: number) => {
    setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
  }, []);

  const handleSaveUser = useCallback((userData: Omit<User, 'id'> & { id?: number }) => {
    setUsers(prevUsers => {
        let updatedUsers;
        if (userData.id) {
            // Logic for editing an existing user
            updatedUsers = prevUsers.map(u => {
                if (u.id !== userData.id) {
                    return u; // Not the user we're editing, return as is.
                }
                // Merge original user with new data. If the incoming data has a 
                // non-empty password, use it. Otherwise, keep the old one.
                return {
                    ...u,
                    ...userData,
                    password: userData.password || u.password,
                } as User;
            });
        } else {
            // Logic for creating a new user
            const newUser: User = { 
                ...userData, 
                id: prevUsers.length > 0 ? Math.max(...prevUsers.map(u => u.id)) + 1 : 1 
            } as User;
            updatedUsers = [...prevUsers, newUser];
        }
        return updatedUsers;
    });
  }, []);
  
  const handleDeleteUser = useCallback((userId: number) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  }, []);

  const handleSaveClass = useCallback((classData: Omit<Class, 'id'> & { id?: number }) => {
    setClasses(prevClasses => {
        let updatedClasses;
        if (classData.id) {
            updatedClasses = prevClasses.map(c => c.id === classData.id ? { ...c, ...classData } as Class : c);
        } else {
            const newClass: Class = { ...classData, id: prevClasses.length > 0 ? Math.max(...prevClasses.map(c => c.id)) + 1 : 1 } as Class;
            updatedClasses = [...prevClasses, newClass];
        }
        return updatedClasses;
    });
  }, []);

  const handleDeleteClass = useCallback((classId: number) => {
    setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
  }, []);

  // --- Notice Handlers ---
  const handleSaveNotice = useCallback((noticeData: Omit<Notice, 'id' | 'timestamp' | 'readBy'>) => {
    setNotices(prevNotices => {
        const newNotice: Notice = {
            ...noticeData,
            id: prevNotices.length > 0 ? Math.max(...prevNotices.map(n => n.id)) + 1 : 1,
            timestamp: new Date().toISOString(),
            readBy: [],
        };
        return [...prevNotices, newNotice];
    });
  }, []);

  const handleMarkNoticeAsRead = useCallback((noticeId: number) => {
      if (!currentUser) return;
      const currentUserId = currentUser.id;
      setNotices(prevNotices => prevNotices.map(notice => {
          if (notice.id === noticeId && !notice.readBy.includes(currentUserId)) {
              return { ...notice, readBy: [...notice.readBy, currentUserId] };
          }
          return notice;
      }));
  }, [currentUser]);

  // --- Schedule Handlers ---
  const handleSaveScheduleEntry = useCallback((entryData: Omit<ScheduleEntry, 'id'> & { id?: number }) => {
    setSchedule(prevSchedule => {
        let updatedSchedule;
        if (entryData.id) {
            updatedSchedule = prevSchedule.map(e => e.id === entryData.id ? { ...e, ...entryData } as ScheduleEntry : e);
        } else {
            const newEntry: ScheduleEntry = {
                ...(entryData as Omit<ScheduleEntry, 'id'>),
                id: prevSchedule.length > 0 ? Math.max(...prevSchedule.map(e => e.id)) + 1 : 1,
            };
            updatedSchedule = [...prevSchedule, newEntry];
        }
        return updatedSchedule;
    });
  }, []);

  const handleDeleteScheduleEntry = useCallback((entryId: number) => {
    setSchedule(prevSchedule => prevSchedule.filter(e => e.id !== entryId));
  }, []);

  // --- Attendance Handler ---
  const handleSaveAttendance = useCallback((classId: number, date: string, attendanceData: Map<number, { status: AttendanceStatus; notes?: string }>) => {
    setAttendance(prevAttendance => {
        const updatedAttendance = [...prevAttendance];
        let nextId = prevAttendance.length > 0 ? Math.max(...prevAttendance.map(a => a.id)) + 1 : 1;

        for (const [studentId, data] of attendanceData.entries()) {
            const recordIndex = updatedAttendance.findIndex(r => r.studentId === studentId && r.date === date);

            if (recordIndex > -1) {
                // Update existing record
                updatedAttendance[recordIndex] = { ...updatedAttendance[recordIndex], status: data.status, notes: data.notes };
            } else {
                // Add new record
                updatedAttendance.push({
                    id: nextId++,
                    studentId,
                    date,
                    status: data.status,
                    notes: data.notes
                });
            }
        }
        return updatedAttendance;
    });
  }, []);

  // --- Data Import/Export Handlers ---
  const handleExportData = useCallback(() => {
    const allData = { users, classes, students, notices, schedule, attendance };
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sapi_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }, [users, classes, students, notices, schedule, attendance]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("O arquivo não pôde ser lido.");
            }

            if (!window.confirm("Atenção: A importação de dados substituirá TODOS os dados atuais do sistema. Esta ação não pode ser desfeita. Deseja continuar?")) {
                return;
            }

            const importedData = JSON.parse(text);
            
            if (Array.isArray(importedData.users) && Array.isArray(importedData.classes) && Array.isArray(importedData.students)) {
                setUsers(importedData.users);
                setClasses(importedData.classes);
                setStudents(importedData.students);
                setNotices(importedData.notices || []);
                setSchedule(importedData.schedule || []);
                setAttendance(importedData.attendance || []);
                alert("Dados importados com sucesso! A aplicação será recarregada.");
                window.location.reload();
            } else {
                throw new Error("Arquivo JSON inválido. Faltam as chaves 'users', 'classes', e 'students'.");
            }
        } catch (error) {
            console.error("Erro ao importar dados:", error);
            alert(`Ocorreu um erro ao importar o arquivo. Verifique se é um backup válido.\n\nDetalhe: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    reader.readAsText(file);
  }, []);

  const dataContextValue = useMemo(() => ({
      students, classes, users, notices, schedule, attendance,
      handleSaveStudent, handleDeleteStudent,
      handleSaveUser, handleDeleteUser,
      handleSaveClass, handleDeleteClass,
      handleSaveNotice, handleMarkNoticeAsRead,
      handleSaveScheduleEntry, handleDeleteScheduleEntry,
      handleSaveAttendance,
      handleExportData, handleImportData
  }), [
      students, classes, users, notices, schedule, attendance,
      handleSaveStudent, handleDeleteStudent,
      handleSaveUser, handleDeleteUser,
      handleSaveClass, handleDeleteClass,
      handleSaveNotice, handleMarkNoticeAsRead,
      handleSaveScheduleEntry, handleDeleteScheduleEntry,
      handleSaveAttendance,
      handleExportData, handleImportData
  ]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, logout: handleLogout }}>
        <DataContext.Provider value={dataContextValue}>
            <Dashboard />
        </DataContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;