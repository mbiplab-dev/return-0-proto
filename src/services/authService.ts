// =============================================================================
// COMPLETE AUTH SERVICE - API Integration
// File path: src/services/authService.ts
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Types and Interfaces
export interface SignupData {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface UpdateProfileData {
  username?: string;
  phone?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  token?: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

export interface ProfileResponse {
  message: string;
  user: User;
}

// Custom error class for better error handling
export class AuthError extends Error {
  public statusCode: number;
  public errors?: string[];

  constructor(message: string, statusCode: number = 400, errors?: string[]) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('userData');
      }
    }
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new AuthError(
        data.message || 'Request failed',
        response.status,
        data.errors
      );
    }
    
    return data;
  }

  // Store authentication data
  private storeAuthData(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  // Clear authentication data
  private clearAuthData(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  // Signup method
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);

      // Store token and user data if provided
      if (result.token && result.user) {
        this.storeAuthData(result.token, result.user);
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login method (supports both email and phone)
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const headers = new Headers({
        'Content-Type': 'application/json',
      });

      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<AuthResponse>(response);

      // Store token and user data if provided
      if (result.token && result.user) {
        this.storeAuthData(result.token, result.user);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      if (this.token) {
        const headers = new Headers({
          'Content-Type': 'application/json',
        });
        headers.append('Authorization', `Bearer ${this.token}`);

        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error on logout - always clear local data
    } finally {
      this.clearAuthData();
    }
  }

  // Verify token
  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${this.token}`);

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        this.clearAuthData();
        return false;
      }

      const result = await response.json();
      
      // Update user data if provided
      if (result.user) {
        this.user = result.user;
        localStorage.setItem('userData', JSON.stringify(result.user));
      }

      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuthData();
      return false;
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await this.apiRequest('/auth/profile', {
        method: 'GET',
      });

      const result = await this.handleResponse<ProfileResponse>(response);

      // Update stored user data
      if (result.user) {
        this.user = result.user;
        localStorage.setItem('userData', JSON.stringify(result.user));
      }

      return result.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await this.apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await this.handleResponse<ProfileResponse>(response);

      // Update stored user data
      if (result.user) {
        this.user = result.user;
        localStorage.setItem('userData', JSON.stringify(result.user));
      }

      return result.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // API request helper with auth headers
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    });

    // Add authorization header if token exists
    if (this.token) {
      headers.append('Authorization', `Bearer ${this.token}`);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 responses by clearing auth data
    if (response.status === 401) {
      this.clearAuthData();
    }

    return response;
  }

  // Refresh user data
  async refreshUserData(): Promise<void> {
    try {
      await this.getProfile();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }

  // Check if token is expired (client-side check)
  isTokenExpired(): boolean {
    if (!this.token) {
      return true;
    }

    try {
      // JWT tokens have 3 parts separated by dots
      const parts = this.token.split('.');
      if (parts.length !== 3) {
        return true;
      }

      // Decode payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Auto-refresh token if needed (to be called periodically)
  async ensureValidToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.clearAuthData();
      return false;
    }

    // Verify token with server
    return await this.verifyToken();
  }

  // Initialize auth service (call this on app startup)
  async initialize(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    return await this.ensureValidToken();
  }

  // Password validation helper
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation helper
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation helper (basic validation)
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;