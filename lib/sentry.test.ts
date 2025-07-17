import { captureError, captureMessage, setUser, clearUser, setContext, addBreadcrumb, withSentry } from './sentry';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

import * as Sentry from '@sentry/nextjs';

describe('Sentry Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('captureError', () => {
    it('should capture error without context', () => {
      const error = new Error('Test error');
      captureError(error);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(Sentry.setContext).not.toHaveBeenCalled();
    });

    it('should capture error with context', () => {
      const error = new Error('Test error');
      const context = { test: 'context' };
      
      captureError(error, context);
      
      expect(Sentry.setContext).toHaveBeenCalledWith('error_context', context);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe('captureMessage', () => {
    it('should capture message with default level', () => {
      const message = 'Test message';
      captureMessage(message);
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, 'info');
    });

    it('should capture message with custom level', () => {
      const message = 'Test message';
      const level = 'warning' as Sentry.SeverityLevel;
      captureMessage(message, level);
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, level);
    });
  });

  describe('setUser', () => {
    it('should set user with all properties', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser'
      };
      
      setUser(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it('should set user with only id', () => {
      const user = { id: 'user123' };
      
      setUser(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });
  });

  describe('clearUser', () => {
    it('should clear user', () => {
      clearUser();
      
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('setContext', () => {
    it('should set context', () => {
      const name = 'test_context';
      const context = { key: 'value' };
      
      setContext(name, context);
      
      expect(Sentry.setContext).toHaveBeenCalledWith(name, context);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb with all properties', () => {
      const message = 'Test breadcrumb';
      const category = 'test_category';
      const data = { test: 'data' };
      const level = 'info' as Sentry.SeverityLevel;
      
      addBreadcrumb(message, category, data, level);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message,
        category,
        data,
        level,
      });
    });

    it('should add breadcrumb with minimal properties', () => {
      const message = 'Test breadcrumb';
      
      addBreadcrumb(message);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message,
        level: 'info',
      });
    });
  });

  describe('withSentry', () => {
    it('should wrap sync function successfully', () => {
      const mockFn = jest.fn().mockReturnValue('success');
      const wrappedFn = withSentry(mockFn, 'testFunction');
      
      const result = wrappedFn('test');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should capture error from sync function', () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const wrappedFn = withSentry(mockFn, 'testFunction');
      
      expect(() => wrappedFn('test')).toThrow(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should wrap async function successfully', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = withSentry(mockFn, 'testFunction');
      
      const result = await wrappedFn('test');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should capture error from async function', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = withSentry(mockFn, 'testFunction');
      
      await expect(wrappedFn('test')).rejects.toThrow(error);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should work without function name', () => {
      const mockFn = jest.fn().mockReturnValue('success');
      const wrappedFn = withSentry(mockFn);
      
      const result = wrappedFn('test');
      
      expect(result).toBe('success');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });
}); 