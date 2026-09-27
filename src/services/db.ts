import {
  Student,
  Teacher,
  ClassEntity,
  Subject,
  ClearanceRequest,
  EmailLog,
  LeaveReason
} from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'acs_students',
  TEACHERS: 'acs_teachers',
  CLASSES: 'acs_classes',
  SUBJECTS: 'acs_subjects',
  REQUESTS: 'acs_requests',
  EMAIL_LOGS: 'acs_email_logs',
  ACTIVE_USER: 'acs_active_user',
};

// Seed Teachers (~21 faculty members)
const INITIAL_TEACHERS: Teacher[] = [
  { id: 't-1', name: 'Dr. Ronald Vance', username: 'rvance', department: 'Computer Science', email: 'r.vance@college.edu', assigned_class_ids: ['c-qla3'] },
  { id: 't-2', name: 'Prof. Katherine Hayes', username: 'khayes', department: 'Computer Science', email: 'k.hayes@college.edu', assigned_class_ids: ['c-qla3'] },
  { id: 't-3', name: 'Prof. Marcus Sterling', username: 'msterling', department: 'Computer Science', email: 'm.sterling@college.edu', assigned_class_ids: ['c-hfc3'] },
  { id: 't-4', name: 'Dr. Sarah Jenkins', username: 'sjenkins', department: 'Artificial Intelligence & DS', email: 's.jenkins@college.edu', assigned_class_ids: ['c-qh2'] },
  { id: 't-5', name: 'Prof. Vikram Patel', username: 'vpatel', department: 'Information Technology', email: 'v.patel@college.edu', assigned_class_ids: ['c-fc2'] },
  { id: 't-6', name: 'Dr. Anita Sharma', username: 'asharma', department: 'Computer Science', email: 'a.sharma@college.edu', assigned_class_ids: ['c-al2'] },
  { id: 't-7', name: 'Prof. David Miller', username: 'dmiller', department: 'Electronics & Comm', email: 'd.miller@college.edu', assigned_class_ids: ['c-qh1'] },
  { id: 't-8', name: 'Dr. Elena Rostova', username: 'erostova', department: 'Computer Science', email: 'e.rostova@college.edu', assigned_class_ids: ['c-fc1'] },
  { id: 't-9', name: 'Prof. Samuel O\'Connor', username: 'soconnor', department: 'Computer Science', email: 's.oconnor@college.edu', assigned_class_ids: ['c-al1'] },
  { id: 't-10', name: 'Dr. Priya Nair', username: 'pnair', department: 'Mathematics Department', email: 'p.nair@college.edu', assigned_class_ids: [] },
  { id: 't-11', name: 'Prof. Thomas Wright', username: 'twright', department: 'Physics & Applied Sciences', email: 't.wright@college.edu', assigned_class_ids: [] },
  { id: 't-12', name: 'Dr. Alan Turing-Green', username: 'agreen', department: 'Humanities & English', email: 'a.green@college.edu', assigned_class_ids: [] },
  { id: 't-13', name: 'Prof. Sunita Rao', username: 'srao', department: 'Electrical Engineering', email: 's.rao@college.edu', assigned_class_ids: [] },
  { id: 't-14', name: 'Dr. James Wilson', username: 'jwilson', department: 'Cyber Security & Networks', email: 'j.wilson@college.edu', assigned_class_ids: [] },
  { id: 't-15', name: 'Prof. Maya Chen', username: 'mchen', department: 'Software Engineering', email: 'm.chen@college.edu', assigned_class_ids: [] },
  { id: 't-16', name: 'Prof. Robert King', username: 'rking', department: 'Database Systems', email: 'r.king@college.edu', assigned_class_ids: [] },
  { id: 't-17', name: 'Dr. Frank Zhao', username: 'fzhao', department: 'Operating Systems Lab', email: 'f.zhao@college.edu', assigned_class_ids: [] },
  { id: 't-18', name: 'Prof. Neha Gupta', username: 'ngupta', department: 'Cloud Computing & DevOps', email: 'n.gupta@college.edu', assigned_class_ids: [] },
  { id: 't-19', name: 'Dr. Tariq Al-Mansoor', username: 'talmansoor', department: 'Embedded & VLSI Systems', email: 't.almansoor@college.edu', assigned_class_ids: [] },
  { id: 't-20', name: 'Prof. Chloe Bennett', username: 'cbennett', department: 'Web Technologies & HCI', email: 'c.bennett@college.edu', assigned_class_ids: [] },
  { id: 't-21', name: 'Dr. Gregory House', username: 'ghouse', department: 'College Medical Center', email: 'g.house@college.edu', assigned_class_ids: [] }
];

// Seed Classes — Exactly the 8 fixed classes
const INITIAL_CLASSES: ClassEntity[] = [
  { id: 'c-qla3', name: 'QLA-3', department_combination: 'Quality Assurance & Leadership', default_teacher_id: 't-2', default_teacher_name: 'Prof. Katherine Hayes' },
  { id: 'c-hfc3', name: 'HFC-3', department_combination: 'Human Factors & Computing', default_teacher_id: 't-3', default_teacher_name: 'Prof. Marcus Sterling' },
  { id: 'c-qh2', name: 'QH-2', department_combination: 'Quantitative Hardware Systems', default_teacher_id: 't-4', default_teacher_name: 'Dr. Sarah Jenkins' },
  { id: 'c-fc2', name: 'FC-2', department_combination: 'Foundations of Computing', default_teacher_id: 't-5', default_teacher_name: 'Prof. Vikram Patel' },
  { id: 'c-al2', name: 'AL-2', department_combination: 'Applied Logic & Software', default_teacher_id: 't-6', default_teacher_name: 'Dr. Anita Sharma' },
  { id: 'c-qh1', name: 'QH-1', department_combination: 'Quantitative Hardware Principles', default_teacher_id: 't-7', default_teacher_name: 'Prof. David Miller' },
  { id: 'c-fc1', name: 'FC-1', department_combination: 'Foundations of Computing Intro', default_teacher_id: 't-8', default_teacher_name: 'Dr. Elena Rostova' },
  { id: 'c-al1', name: 'AL-1', department_combination: 'Applied Logic & Methods', default_teacher_id: 't-9', default_teacher_name: 'Prof. Samuel O\'Connor' }
];

// Seed Subjects — Tied to specific classes via many-to-many class_ids mapping
const INITIAL_SUBJECTS: Subject[] = [
  { id: 's-101', name: 'Engineering Mathematics I', code: 'MATH101', class_ids: ['c-qh1', 'c-fc1', 'c-al1'] },
  { id: 's-102', name: 'Applied Physics & Mechanics', code: 'PHYS102', class_ids: ['c-qh1', 'c-fc1'] },
  { id: 's-103', name: 'Basic Electrical & Electronics', code: 'ELEC103', class_ids: ['c-qh1', 'c-al1'] },
  { id: 's-104', name: 'Engineering Graphics & CAD', code: 'ENGR104', class_ids: ['c-fc1', 'c-al1'] },
  { id: 's-105', name: 'Python Programming Lab', code: 'CS105', class_ids: ['c-qh1', 'c-fc1', 'c-al1'] },
  { id: 's-106', name: 'Technical English & Ethics', code: 'HUM106', class_ids: ['c-qh1', 'c-fc1', 'c-al1', 'c-qh2', 'c-fc2', 'c-al2'] },
  { id: 's-201', name: 'Data Structures & Algorithms', code: 'CS201', class_ids: ['c-qh2', 'c-fc2', 'c-al2'] },
  { id: 's-202', name: 'Discrete Mathematics', code: 'MATH202', class_ids: ['c-fc2', 'c-al2'] },
  { id: 's-203', name: 'Digital Logic & Computer Org', code: 'CS203', class_ids: ['c-qh2', 'c-fc2'] },
  { id: 's-204', name: 'OOP & Design Patterns in Java', code: 'CS204', class_ids: ['c-qh2', 'c-fc2', 'c-al2'] },
  { id: 's-205', name: 'Database Management Systems', code: 'CS205', class_ids: ['c-qh2', 'c-fc2', 'c-al2', 'c-qla3', 'c-hfc3'] },
  { id: 's-206', name: 'Environmental Science', code: 'ENV206', class_ids: ['c-qh2', 'c-fc2', 'c-al2'] },
  { id: 's-301', name: 'Operating Systems & Kernel Dev', code: 'CS301', class_ids: ['c-qla3', 'c-hfc3'] },
  { id: 's-302', name: 'Computer Networks & Security', code: 'CS302', class_ids: ['c-qla3', 'c-hfc3'] },
  { id: 's-303', name: 'Design & Analysis of Algorithms', code: 'CS303', class_ids: ['c-qla3', 'c-hfc3'] },
  { id: 's-304', name: 'Full Stack Web Engineering', code: 'CS304', class_ids: ['c-qla3', 'c-hfc3'] },
  { id: 's-305', name: 'Software Engineering & DevOps', code: 'CS305', class_ids: ['c-qla3', 'c-hfc3'] },
  { id: 's-306', name: 'Artificial Intelligence Foundations', code: 'AI306', class_ids: ['c-qla3', 'c-hfc3'] }
];

// Seed Students (Grouped solely by the 8 fixed classes)
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    roll_no: '22CS041',
    name: 'Aarav Mehta',
    class_id: 'c-fc2',
    class_name: 'FC-2',
    department: 'Computer Science & Engineering',
    gmail: 'aarav.mehta.col@gmail.com',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'stu-2',
    roll_no: '23CS105',
    name: 'Zoya Akhtar',
    class_id: 'c-qh1',
    class_name: 'QH-1',
    department: 'Computer Science',
    gmail: 'zoya.akhtar.stu@gmail.com',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 'stu-3',
    roll_no: '21CS088',
    name: 'Rahul Deshmukh',
    class_id: 'c-qla3',
    class_name: 'QLA-3',
    department: 'Computer Science',
    gmail: 'rahul.deshmukh21@gmail.com',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'stu-4',
    roll_no: '21CS012',
    name: 'Pooja Hegde',
    class_id: 'c-hfc3',
    class_name: 'HFC-3',
    department: 'Computer Science',
    gmail: 'pooja.hegde.sen@gmail.com',
    created_at: new Date(Date.now() - 80 * 86400000).toISOString()
  },
  {
    id: 'stu-5',
    roll_no: '22IT019',
    name: 'Karthik Raman',
    class_id: 'c-al2',
    class_name: 'AL-2',
    department: 'Information Technology',
    gmail: '', // Empty initially to test personal Gmail address prompt!
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

// Helper to format date string YYYY-MM-DD
export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Compute 14-day deadline date and overdue status
export function calculateOverdueInfo(leaveEndDateStr: string, submissionDateStr: string) {
  const leaveEnd = new Date(leaveEndDateStr);
  const deadline = new Date(leaveEnd);
  deadline.setDate(deadline.getDate() + 14);
  const deadlineDateStr = formatDate(deadline);

  const subDate = new Date(submissionDateStr);
  const isOverdue = subDate.getTime() > deadline.getTime();

  return {
    deadlineDateStr,
    isOverdue
  };
}

// Initial Sample Clearance Requests representing all lifecycle states
const today = new Date();
const dMinus2 = new Date(today); dMinus2.setDate(dMinus2.getDate() - 2);
const dMinus5 = new Date(today); dMinus5.setDate(dMinus5.getDate() - 5);
const dMinus10 = new Date(today); dMinus10.setDate(dMinus10.getDate() - 10);
const dMinus25 = new Date(today); dMinus25.setDate(dMinus25.getDate() - 25);
const dMinus30 = new Date(today); dMinus30.setDate(dMinus30.getDate() - 30);

const INITIAL_REQUESTS: ClearanceRequest[] = [
  // 1. OVERDUE REQUEST (submitted today for leave 30 to 25 days ago => deadline was 11 days ago)
  {
    id: 'req-overdue-1',
    student_id: 'stu-1',
    student: INITIAL_STUDENTS[0],
    teacher_id: 't-5',
    assigned_teacher_name: 'Prof. Vikram Patel',
    assigned_teacher_email: 'v.patel@college.edu',
    reason: 'Medical',
    leave_start_date: formatDate(dMinus30),
    leave_end_date: formatDate(dMinus25),
    submission_date: formatDate(today),
    deadline_date: formatDate(new Date(dMinus25.getTime() + 14 * 86400000)),
    subjects_missed: ['Data Structures & Algorithms', 'Discrete Mathematics'],
    remarks: 'Severe viral fever and typhoid; hospitalization delayed documentation submission.',
    document_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    document_name: 'Hospital_Discharge_Summary_Signed.pdf',
    status: 'pending',
    is_overdue: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    reminder_count: 0
  },
  // 2. NORMAL PENDING (submitted 2 days ago > 24 hours, eligible for "Send Reminder" button!)
  {
    id: 'req-pending-2',
    student_id: 'stu-1',
    student: INITIAL_STUDENTS[0],
    teacher_id: 't-5',
    assigned_teacher_name: 'Prof. Vikram Patel',
    assigned_teacher_email: 'v.patel@college.edu',
    reason: 'Official College Work',
    leave_start_date: formatDate(dMinus5),
    leave_end_date: formatDate(dMinus2),
    submission_date: formatDate(dMinus2),
    deadline_date: formatDate(new Date(dMinus2.getTime() + 14 * 86400000)),
    subjects_missed: ['OOP & Design Patterns in Java', 'Database Management Systems'],
    remarks: 'Represented college in National Smart India Hackathon zonal round.',
    document_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    document_name: 'Hackathon_Participation_Proof.pdf',
    status: 'pending',
    is_overdue: false,
    created_at: new Date(Date.now() - 28 * 3600000).toISOString(), // 28 hours ago (>24h)
    reminder_count: 0
  },
  // 3. APPROVED BY TEACHER (Stage 2: Awaiting Office Admin verification in SHUHOOD!)
  {
    id: 'req-approved-3',
    student_id: 'stu-2',
    student: INITIAL_STUDENTS[1],
    teacher_id: 't-7',
    assigned_teacher_name: 'Prof. David Miller',
    assigned_teacher_email: 'd.miller@college.edu',
    reason: 'Medical',
    leave_start_date: formatDate(dMinus10),
    leave_end_date: formatDate(dMinus5),
    submission_date: formatDate(dMinus5),
    deadline_date: formatDate(new Date(dMinus5.getTime() + 14 * 86400000)),
    subjects_missed: ['Engineering Mathematics I', 'Applied Physics & Mechanics'],
    remarks: 'Doctor advised bed rest for acute bronchitis.',
    document_name: 'Medical_Prescription_Cert.pdf',
    status: 'approved',
    is_overdue: false,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    approved_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  // 4. VERIFIED / CLEARED (Stage 3: Full complete clearance)
  {
    id: 'req-verified-4',
    student_id: 'stu-3',
    student: INITIAL_STUDENTS[2],
    teacher_id: 't-2',
    assigned_teacher_name: 'Prof. Katherine Hayes',
    assigned_teacher_email: 'k.hayes@college.edu',
    reason: 'Family Emergency',
    leave_start_date: formatDate(new Date(today.getTime() - 18 * 86400000)),
    leave_end_date: formatDate(new Date(today.getTime() - 15 * 86400000)),
    submission_date: formatDate(new Date(today.getTime() - 14 * 86400000)),
    deadline_date: formatDate(new Date(today.getTime() - 1 * 86400000)),
    subjects_missed: ['Operating Systems & Kernel Dev', 'Computer Networks & Security'],
    remarks: 'Urgent family situation requiring travel out of station.',
    status: 'verified',
    is_overdue: false,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    approved_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    verified_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    admin_notes: 'Updated in SHUHOOD Register Book Vol. IV.'
  }
];

// Initialize Storage if empty or outdated
export function initDB(): void {
  if (typeof window === 'undefined') return;

  const storedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
  // Migrate if classes are missing or not using the new 8 fixed classes
  if (!storedClasses || !storedClasses.includes('QLA-3')) {
    resetDBToSeed();
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
  }
}

// Reset Database to Seed State
export function resetDBToSeed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify([]));
}

// --- STUDENT DATA OPERATIONS ---
// Supabase query equivalent: supabase.from('students').select('*')
export function getStudents(): Student[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
}

export function getStudentByRoll(rollNo: string): Student | null {
  const students = getStudents();
  return students.find(s => s.roll_no.trim().toLowerCase() === rollNo.trim().toLowerCase()) || null;
}

// Supabase query equivalent: supabase.from('students').upsert(student)
export function saveStudent(student: Student): Student {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === student.id || s.roll_no === student.roll_no);
  if (idx >= 0) {
    students[idx] = { ...students[idx], ...student };
  } else {
    students.push(student);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return student;
}

// --- TEACHER DATA OPERATIONS ---
// Supabase query equivalent: supabase.from('teachers').select('*').order('name')
export function getTeachers(): Teacher[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  return raw ? JSON.parse(raw) : INITIAL_TEACHERS;
}

export function getTeacherById(id: string): Teacher | null {
  return getTeachers().find(t => t.id === id) || null;
}

export function saveTeacher(teacher: Teacher): Teacher {
  const teachers = getTeachers();
  const idx = teachers.findIndex(t => t.id === teacher.id);
  if (idx >= 0) {
    teachers[idx] = teacher;
  } else {
    teachers.push(teacher);
  }
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  return teacher;
}

export function deleteTeacher(id: string): void {
  const teachers = getTeachers().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
}

// --- CLASS DATA OPERATIONS ---
// Supabase query equivalent: supabase.from('classes').select('*')
export function getClasses(): ClassEntity[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
  return raw ? JSON.parse(raw) : INITIAL_CLASSES;
}

export function getClassById(id: string): ClassEntity | null {
  return getClasses().find(c => c.id === id) || null;
}

export function saveClass(cls: ClassEntity): ClassEntity {
  const classes = getClasses();
  const teachers = getTeachers();
  const teacher = teachers.find(t => t.id === cls.default_teacher_id);
  cls.default_teacher_name = teacher ? teacher.name : '';
  const idx = classes.findIndex(c => c.id === cls.id);
  if (idx >= 0) {
    classes[idx] = cls;
  } else {
    classes.push(cls);
  }
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  return cls;
}

export function deleteClass(id: string): void {
  const classes = getClasses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

// --- SUBJECT DATA OPERATIONS ---
// Subjects mapped directly to classes via class_ids join relation
// Supabase query equivalent: supabase.from('class_subjects').select('subjects(*)').eq('class_id', classId)
export function getSubjects(): Subject[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  return raw ? JSON.parse(raw) : INITIAL_SUBJECTS;
}

export function getSubjectsByClass(classId: string): Subject[] {
  return getSubjects().filter(s => Array.isArray(s.class_ids) && s.class_ids.includes(classId));
}

export function saveSubject(subject: Subject): Subject {
  const subjects = getSubjects();
  const idx = subjects.findIndex(s => s.id === subject.id);
  if (idx >= 0) {
    subjects[idx] = subject;
  } else {
    subjects.push(subject);
  }
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  return subject;
}

export function deleteSubject(id: string): void {
  const subjects = getSubjects().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

// --- REQUESTS DATA OPERATIONS ---
// Supabase query equivalent: supabase.from('requests').select('*, students(*), teachers(*)')
export function getRequests(): ClearanceRequest[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
}

export function getRequestById(id: string): ClearanceRequest | null {
  return getRequests().find(r => r.id === id) || null;
}

export interface CreateRequestInput {
  student: Student;
  teacher_id: string;
  reason: LeaveReason;
  reason_other_details?: string;
  leave_start_date: string;
  leave_end_date: string;
  subjects_missed: string[];
  remarks?: string;
  document_url?: string;
  document_name?: string;
}

// Supabase query equivalent: supabase.from('requests').insert(...)
export function createRequest(input: CreateRequestInput): ClearanceRequest {
  const requests = getRequests();
  const teachers = getTeachers();
  const assignedTeacher = teachers.find(t => t.id === input.teacher_id);
  
  // Find student's class and default class teacher
  const classes = getClasses();
  const studentClass = classes.find(c => c.id === input.student.class_id);
  const defaultClassTeacherId = studentClass ? studentClass.default_teacher_id : '';
  const defaultClassTeacher = teachers.find(t => t.id === defaultClassTeacherId);

  const isDifferentTeacher = defaultClassTeacherId && input.teacher_id !== defaultClassTeacherId;

  const submissionDateStr = formatDate(new Date());
  const { deadlineDateStr, isOverdue } = calculateOverdueInfo(input.leave_end_date, submissionDateStr);

  const newReq: ClearanceRequest = {
    id: 'req-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    student_id: input.student.id,
    student: input.student,
    teacher_id: input.teacher_id,
    assigned_teacher_name: assignedTeacher ? assignedTeacher.name : 'Unknown Faculty',
    assigned_teacher_email: assignedTeacher ? assignedTeacher.email : '',
    class_teacher_id_if_different: isDifferentTeacher ? defaultClassTeacherId : undefined,
    class_teacher_name: isDifferentTeacher && defaultClassTeacher ? defaultClassTeacher.name : undefined,
    class_teacher_email: isDifferentTeacher && defaultClassTeacher ? defaultClassTeacher.email : undefined,
    reason: input.reason,
    reason_other_details: input.reason_other_details,
    leave_start_date: input.leave_start_date,
    leave_end_date: input.leave_end_date,
    submission_date: submissionDateStr,
    deadline_date: deadlineDateStr,
    subjects_missed: input.subjects_missed,
    remarks: input.remarks,
    document_url: input.document_url,
    document_name: input.document_name,
    status: 'pending',
    is_overdue: isOverdue, // Computed: submitted_at > leave_end_date + 14 days
    created_at: new Date().toISOString(),
    reminder_count: 0
  };

  requests.unshift(newReq);
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return newReq;
}

// Teacher approves request
// Supabase query equivalent: supabase.from('requests').update({ status: 'approved', approved_at: NOW() }).eq('id', id)
export function approveRequest(id: string): ClearanceRequest {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  requests[idx].status = 'approved';
  requests[idx].approved_at = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[idx];
}

// Teacher or Admin rejects request
// Supabase query equivalent: supabase.from('requests').update({ status: 'rejected', rejected_at: NOW(), rejection_reason: reason }).eq('id', id)
export function rejectRequest(id: string, reason: string, templateType?: string): ClearanceRequest {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  requests[idx].status = 'rejected';
  requests[idx].rejected_at = new Date().toISOString();
  requests[idx].rejection_reason = reason;
  requests[idx].rejection_template_type = templateType;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[idx];
}

// Admin marks verified/cleared (Stage 3 after manual update in SHUHOOD)
// Supabase query equivalent: supabase.from('requests').update({ status: 'verified', verified_at: NOW(), admin_notes: notes }).eq('id', id)
export function verifyRequest(id: string, adminNotes?: string): ClearanceRequest {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  requests[idx].status = 'verified';
  requests[idx].verified_at = new Date().toISOString();
  if (adminNotes) {
    requests[idx].admin_notes = adminNotes;
  }
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[idx];
}

// Record teacher reminder sent
export function recordReminderSent(id: string): ClearanceRequest {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  requests[idx].last_reminder_sent_at = new Date().toISOString();
  requests[idx].reminder_count = (requests[idx].reminder_count || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[idx];
}

// Helper to check if request has been pending for >= 24 hours
export function isEligibleForReminder(req: ClearanceRequest): boolean {
  if (req.status !== 'pending') return false;
  const created = new Date(req.created_at).getTime();
  const now = Date.now();
  const hoursElapsed = (now - created) / (1000 * 60 * 60);
  return hoursElapsed >= 24;
}

// Helper to simulate 24 hours elapsed for testing convenience
export function simulate24HoursElapsed(id: string): ClearanceRequest {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');

  const oldDate = new Date(Date.now() - 25 * 3600000);
  requests[idx].created_at = oldDate.toISOString();
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  return requests[idx];
}

// --- EMAIL AUDIT LOG OPERATIONS ---
// Supabase query equivalent: supabase.from('email_logs').select('*').order('sent_at', { ascending: false })
export function getEmailLogs(): EmailLog[] {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS);
  return raw ? JSON.parse(raw) : [];
}

export function logEmailEvent(log: Omit<EmailLog, 'id' | 'sent_at'>): EmailLog {
  const logs = getEmailLogs();
  const newLog: EmailLog = {
    ...log,
    id: 'email-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    sent_at: new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.EMAIL_LOGS, JSON.stringify(logs));
  return newLog;
}
