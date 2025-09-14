// =============================================================================
// TYPES: Authentication Related Types
// File path: src/types/auth.ts
// =============================================================================

export interface LoginFormData {
  email: string;
  phone: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Partial<LoginFormData>) => Promise<void>;
  signup: (userData: SignupFormData) => Promise<void>;
  logout: () => void;
  googleAuth: () => Promise<void>;
}

export type LoginMethod = 'email' | 'phone';

export interface AuthScreenProps {
  onAuthSuccess: () => void;
}