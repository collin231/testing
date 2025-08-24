import { jest } from '@jest/globals';
import authService from '../services/authService';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn()
    }
  }))
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      const mockResponse = {
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      };

      // Mock the signUp method
      const mockSignUp = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signUp = mockSignUp;

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
    });

    it('should handle registration errors', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      };

      const mockError = new Error('Email already exists');
      const mockResponse = {
        data: null,
        error: mockError
      };

      const mockSignUp = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signUp = mockSignUp;

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        data: { 
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null
      };

      const mockSignIn = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signInWithPassword = mockSignIn;

      const result = await authService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      const mockResponse = {
        data: null,
        error: mockError
      };

      const mockSignIn = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signInWithPassword = mockSignIn;

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      const mockResponse = { error: null };
      const mockSignOut = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signOut = mockSignOut;

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      const mockError = new Error('Logout failed');
      const mockResponse = { error: mockError };
      const mockSignOut = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.signOut = mockSignOut;

      const result = await authService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully get current user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockResponse = {
        data: { user: mockUser },
        error: null
      };

      const mockGetUser = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.getUser = mockGetUser;

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should handle getCurrentUser errors', async () => {
      const mockError = new Error('User not found');
      const mockResponse = {
        data: { user: null },
        error: mockError
      };

      const mockGetUser = jest.fn().mockResolvedValue(mockResponse);
      authService.supabase.auth.getUser = mockGetUser;

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });
});
