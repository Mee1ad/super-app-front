import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  
  // Performance Monitoring
  tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "1.0"),
  profilesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE || "1.0"),
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
  
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE || "1.0"),
  
  // Enable auto-instrumentation
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  
  // Send default PII
  sendDefaultPii: true,
  
  // Ignore specific errors
  ignoreErrors: [
    // Ignore specific error messages
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
  
  // Filter out specific URLs
  beforeSend(event) {
    // Don't send events from localhost in development
    if (process.env.NODE_ENV === "development" && window.location.hostname === "localhost") {
      return null;
    }
    return event;
  },
}); 