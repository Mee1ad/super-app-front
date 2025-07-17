import * as Sentry from "@sentry/nextjs";

/**
 * Capture and report errors to Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Capture and report messages to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Set additional context for Sentry
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, any>,
  level: Sentry.SeverityLevel = "info"
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
  });
}

/**
 * Wrap a function with Sentry error tracking
 */
export function withSentry<T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, { functionName: name, args });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      captureError(error as Error, { functionName: name, args });
      throw error;
    }
  }) as T;
} 