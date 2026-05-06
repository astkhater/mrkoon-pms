import { useAuth } from '../context/AuthContext.jsx';

export function useRole() {
  const { role } = useAuth();
  return {
    role,
    isAdmin:    role === 'admin',
    isHR:       role === 'hr',
    isFinance:  role === 'finance',
    isCLevel:   role === 'c_level',
    isDeptHead: role === 'dept_head',
    isManager:  role === 'manager',
    isEmployee: role === 'employee',
  };
}
