'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { captureError, captureMessage, setUser, setContext, addBreadcrumb } from '@/lib/sentry';

export default function TestSentryPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testErrorCapture = () => {
    try {
      addResult('Testing error capture...');
      throw new Error('This is a test error from frontend');
    } catch (error) {
      captureError(error as Error, { 
        context: 'frontend-test',
        component: 'TestSentryPage',
        action: 'testErrorCapture'
      });
      addResult('✅ Error captured and sent to Sentry');
    }
  };

  const testMessageCapture = () => {
    addResult('Testing message capture...');
    captureMessage('This is a test message from frontend', 'info');
    addResult('✅ Message captured and sent to Sentry');
  };

  const testUserContext = () => {
    addResult('Testing user context...');
    setUser({
      id: 'frontend-test-user-123',
      email: 'frontend-test@example.com',
      username: 'frontend-testuser'
    });
    addResult('✅ User context set');
  };

  const testAdditionalContext = () => {
    addResult('Testing additional context...');
    setContext('frontend_test_context', {
      page: 'test-sentry',
      purpose: 'testing',
      timestamp: new Date().toISOString()
    });
    addResult('✅ Additional context set');
  };

  const testBreadcrumb = () => {
    addResult('Testing breadcrumb...');
    addBreadcrumb('User clicked test button', 'user_action', {
      button: 'testBreadcrumb',
      timestamp: new Date().toISOString()
    });
    addResult('✅ Breadcrumb added');
  };

  const testAsyncError = async () => {
    addResult('Testing async error capture...');
    try {
      const asyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        throw new Error('This is an async test error');
      };
      await asyncFunction();
    } catch (error) {
      captureError(error as Error, { 
        context: 'frontend-async-test',
        component: 'TestSentryPage',
        action: 'testAsyncError'
      });
      addResult('✅ Async error captured and sent to Sentry');
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Sentry Integration Test</CardTitle>
          <CardDescription>
            Test various Sentry features to verify error tracking and monitoring is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button onClick={testErrorCapture} variant="destructive">
              Test Error Capture
            </Button>
            <Button onClick={testMessageCapture} variant="secondary">
              Test Message Capture
            </Button>
            <Button onClick={testUserContext} variant="outline">
              Test User Context
            </Button>
            <Button onClick={testAdditionalContext} variant="outline">
              Test Additional Context
            </Button>
            <Button onClick={testBreadcrumb} variant="outline">
              Test Breadcrumb
            </Button>
            <Button onClick={testAsyncError} variant="outline">
              Test Async Error
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Test Results:</h3>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No test results yet. Click a test button above to start testing.</p>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 What to Check:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your Sentry dashboard for captured events</li>
              <li>• Verify errors include stack traces and context</li>
              <li>• Confirm messages include user and additional context</li>
              <li>• Look for breadcrumbs in the event timeline</li>
              <li>• Check that async errors are properly captured</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 