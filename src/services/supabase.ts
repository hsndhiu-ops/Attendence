import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser } from '../context/AuthContext';
import { getTeachers } from './db';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Pre-seeded password storage key in localStorage for offline / mock fallback
const LOCAL_CREDENTIALS_KEY = 'acs_supabase_passwords';

interface StoredCredential {
  email: string;
  passwordHash: string; // Plain or hashed in local storage
  role: 'teacher' | 'admin' | 'main_admin';
  name: string;
}

// Initial pre-seeded credentials for Teachers, Office Admin, and Main Admin
const DEFAULT_PRESEEDED_CREDENTIALS: StoredCredential[] = [
  // Office Admins (password: admin123)
  {
    email: 'registrar@college.edu',
    passwordHash: 'admin123',
    role: 'admin',
    name: 'Office Registrar'
  },
  {
    email: 's.connor@college.edu',
    passwordHash: 'admin123',
    role: 'admin',
    name: 'Sarah Connor'
  },
  // Main Admin (password: master2026)
  {
    email: 'controller@institution.edu',
    passwordHash: 'master2026',
    role: 'main_admin',
    name: 'System Controller'
  },
  // Faculty Teachers (default password: teacher123)
  {
    email: 'v.patel@college.edu',
    passwordHash: 'teacher123',
    role: 'teacher',
    name: 'Prof. Vikram Patel'
  },
  {
    email: 'd.miller@college.edu',
    passwordHash: 'teacher123',
    role: 'teacher',
    name: 'Prof. David Miller'
  },
  {
    email: 'k.hayes@college.edu',
    passwordHash: 'teacher123',
    role: 'teacher',
    name: 'Prof. Katherine Hayes'
  },
  {
    email: 'r.vance@college.edu',
    passwordHash: 'teacher123',
    role: 'teacher',
    name: 'Dr. Ronald Vance'
  },
  {
    email: 's.jenkins@college.edu',
    passwordHash: 'teacher123',
    role: 'teacher',
    name: 'Dr. Sarah Jenkins'
  }
];

function getLocalCredentials(): StoredCredential[] {
  try {
    const raw = localStorage.getItem(LOCAL_CREDENTIALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read local credentials', e);
  }
  return DEFAULT_PRESEEDED_CREDENTIALS;
}

function saveLocalCredentials(creds: StoredCredential[]): void {
  try {
    localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save local credentials', e);
  }
}

/**
 * Sign in Teacher or Office Admin or Main Admin with email + password via Supabase Auth
 */
export async function signInWithEmailPassword(
  email: string,
  password: string,
  expectedRole?: 'teacher' | 'admin' | 'main_admin'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. If live Supabase is configured, attempt real Supabase Auth
  if (supabase && isLiveSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const metadata = data.user.user_metadata || {};
        const role = metadata.role || expectedRole || 'teacher';
        const authUser: AuthUser = {
          id: data.user.id,
          name: metadata.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || cleanEmail,
          role,
          department: metadata.department
        };
        return { success: true, user: authUser };
      }
    } catch (e: any) {
      console.warn('Live Supabase Auth encountered error, falling back to local pre-seeded credentials:', e);
    }
  }

  // 2. Pre-seeded Supabase Auth Simulation (seamless for demo & local preview)
  const creds = getLocalCredentials();
  const matching = creds.find(c => c.email.toLowerCase() === cleanEmail);

  if (!matching) {
    // Check if it's one of the other seed teachers
    const teachers = getTeachers();
    const foundTeacher = teachers.find(t => t.email.toLowerCase() === cleanEmail);
    if (foundTeacher) {
      if (cleanPass === 'teacher123') {
        const authUser: AuthUser = {
          id: foundTeacher.id,
          name: foundTeacher.name,
          email: foundTeacher.email,
          role: 'teacher',
          department: foundTeacher.department
        };
        return { success: true, user: authUser };
      }
      return { success: false, error: 'Invalid password. Hint: default is teacher123' };
    }
    return { success: false, error: 'Account not found. Teacher and Office Admin accounts are pre-seeded by administration.' };
  }

  if (expectedRole && matching.role !== expectedRole) {
    return { 
      success: false, 
      error: `Account is registered as ${matching.role === 'admin' ? 'Office Admin' : matching.role}, not ${expectedRole}.` 
    };
  }

  if (matching.passwordHash !== cleanPass) {
    return { success: false, error: 'Incorrect password. Please verify your credentials.' };
  }

  // Find detailed teacher data if applicable
  const teachers = getTeachers();
  const teacherData = teachers.find(t => t.email.toLowerCase() === cleanEmail);

  const authUser: AuthUser = {
    id: teacherData ? teacherData.id : (matching.role === 'main_admin' ? 'main-admin-1' : (matching.role === 'admin' ? 'admin-1' : 't-5')),
    name: matching.name,
    email: matching.email,
    role: matching.role,
    department: teacherData ? teacherData.department : (matching.role === 'admin' ? 'Chief Attendance Officer' : 'Site Controller')
  };

  return { success: true, user: authUser };
}

/**
 * Change password for current logged-in user
 */
export async function changeUserPassword(
  email: string,
  oldPass: string,
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOld = oldPass.trim();
  const cleanNew = newPass.trim();

  if (!cleanNew || cleanNew.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  // 1. Live Supabase update
  if (supabase && isLiveSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: cleanNew
      });
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      console.warn('Live Supabase password update warning:', e);
    }
  }

  // 2. Local credentials update
  const creds = getLocalCredentials();
  const index = creds.findIndex(c => c.email.toLowerCase() === cleanEmail);

  if (index !== -1) {
    if (creds[index].passwordHash !== cleanOld) {
      return { success: false, error: 'Current password does not match.' };
    }
    creds[index].passwordHash = cleanNew;
    saveLocalCredentials(creds);
    return { success: true };
  } else {
    // If user was dynamically logged in with default teacher123
    creds.push({
      email: cleanEmail,
      passwordHash: cleanNew,
      role: 'teacher',
      name: cleanEmail.split('@')[0]
    });
    saveLocalCredentials(creds);
    return { success: true };
  }
}
