import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'student' | 'teacher' | 'admin' | 'main_admin';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  admission_no?: string; // e.g. "22CS041" (students only)
  class_name?: string;   // One of the 8 fixed classes (students only)
  department?: string;   // Optional/faculty department
}

export const MAIN_ADMIN_USER: AuthUser = {
  id: 'main-admin-1',
  name: 'System Controller',
  role: 'main_admin',
  email: 'controller@institution.edu',
  department: 'System Architecture & Site Controller'
};

export const PRESET_USERS: AuthUser[] = [
  // Student Personas
  {
    id: 'stu-1',
    name: 'Aarav Mehta',
    role: 'student',
    email: 'aarav.mehta.col@gmail.com',
    admission_no: '22CS041',
    class_name: 'FC-2',
    department: 'Computer Science & Engineering'
  },
  {
    id: 'stu-2',
    name: 'Zoya Akhtar',
    role: 'student',
    email: 'zoya.akhtar@gmail.com',
    admission_no: '23CS105',
    class_name: 'QH-1',
    department: 'Computer Science'
  },
  {
    id: 'stu-3',
    name: 'Rahul Deshmukh',
    role: 'student',
    email: 'rahul.deshmukh@gmail.com',
    admission_no: '21CS088',
    class_name: 'QLA-3',
    department: 'Computer Science'
  },
  // Teacher Personas
  {
    id: 't-5',
    name: 'Prof. Vikram Patel',
    role: 'teacher',
    email: 'v.patel@college.edu',
    department: 'Information Technology'
  },
  {
    id: 't-7',
    name: 'Prof. David Miller',
    role: 'teacher',
    email: 'dmiller@college.edu',
    department: 'Electronics & Comm'
  },
  {
    id: 't-2',
    name: 'Prof. Katherine Hayes',
    role: 'teacher',
    email: 'khayes@college.edu',
    department: 'Computer Science'
  },
  // Admin Persona
  {
    id: 'admin-1',
    name: 'Office Registrar',
    role: 'admin',
    email: 'registrar@college.edu',
    department: 'Chief Attendance Officer'
  },
  // Main Admin Persona (Site Owner)
  MAIN_ADMIN_USER
];

interface AuthContextType {
  currentUser: AuthUser | null;
  switchUser: (user: AuthUser) => void;
  updateCurrentUserProfile: (profile: Partial<AuthUser>) => void;
  logout: () => void;
  availableUsers: AuthUser[];
}

const STORAGE_KEY = 'attendance_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
    }
    // Default to Aarav Mehta
    return PRESET_USERS[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  const switchUser = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const updateCurrentUserProfile = (profile: Partial<AuthUser>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...profile };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        updateCurrentUserProfile,
        logout,
        availableUsers: PRESET_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
