import { User, UserRole } from '../types';

export interface BackendUser {
  id: string | number;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

export interface DemoCredential {
  role: UserRole;
  email: string;
  label: string;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'tt_coordinator', email: 'coordinator@smartsched.edu', label: 'TT Coordinator' },
  { role: 'faculty', email: 'faculty@smartsched.edu', label: 'Faculty' },
  { role: 'student', email: 'student@smartsched.edu', label: 'Student' },
  { role: 'exam_incharge', email: 'examiner@smartsched.edu', label: 'Exam In-Charge' },
  { role: 'hod', email: 'hod@smartsched.edu', label: 'HOD' },
  { role: 'principal', email: 'principal@smartsched.edu', label: 'Principal' },
];

export const isGoogleOAuthConfigured = (clientId?: string): boolean => {
  if (!clientId) {
    return false;
  }

  return !['replace-with-google-client-id', 'your-google-client-id'].includes(clientId);
};

export const mapBackendUser = (backendUser: BackendUser): User => {
  const fullName = `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim();
  const resolvedName = fullName || backendUser.username || backendUser.email;

  return {
    id: String(backendUser.id),
    name: resolvedName,
    email: backendUser.email,
    role: backendUser.role,
    department: backendUser.department,
    phone: backendUser.phone,
  };
};