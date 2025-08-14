export interface AuthUser {
  id: string;
  username: string;
  role: 'instructor' | 'student';
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const getCurrentUser = (): AuthUser | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: AuthUser) => {
  localStorage.setItem('user', JSON.stringify(user));
  // Trigger custom event to notify components of auth change
  window.dispatchEvent(new Event('auth-change'));
};

export const clearCurrentUser = () => {
  localStorage.removeItem('user');
  // Trigger custom event to notify components of auth change
  window.dispatchEvent(new Event('auth-change'));
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const isInstructor = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'instructor';
};

export const isStudent = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'student';
};
