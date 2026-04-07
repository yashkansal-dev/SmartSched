import { describe, expect, it } from 'vitest';
import { DEMO_CREDENTIALS, mapBackendUser } from './auth';

describe('auth helpers', () => {
  it('maps a backend user into the frontend user shape', () => {
    const user = mapBackendUser({
      id: 7,
      username: 'faculty_demo',
      email: 'faculty@smartsched.edu',
      first_name: 'Michael',
      last_name: 'Chen',
      role: 'faculty',
      department: 'Computer Science',
      phone: '+1-555-0102',
    });

    expect(user).toEqual({
      id: '7',
      name: 'Michael Chen',
      email: 'faculty@smartsched.edu',
      role: 'faculty',
      department: 'Computer Science',
      phone: '+1-555-0102',
    });
  });

  it('falls back to username and email when names are absent', () => {
    const user = mapBackendUser({
      id: 'abc',
      username: 'principal_demo',
      email: 'principal@smartsched.edu',
      role: 'principal',
    });

    expect(user.name).toBe('principal_demo');
    expect(user.id).toBe('abc');
  });

  it('exposes the seeded demo credentials for every role', () => {
    expect(DEMO_CREDENTIALS).toHaveLength(6);
    expect(DEMO_CREDENTIALS.map((cred) => cred.role)).toEqual([
      'tt_coordinator',
      'faculty',
      'student',
      'exam_incharge',
      'hod',
      'principal',
    ]);
  });
});
