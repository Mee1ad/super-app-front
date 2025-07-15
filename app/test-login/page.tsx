'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/auth/atoms/useAuth';
import { getCurrentUser } from '@/lib/permissions';

export default function TestLoginPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [storageData, setStorageData] = useState<{
    accessToken: string;
    refreshToken: string;
    user: Record<string, unknown> | string;
    allKeys: string[];
  } | null>(null);

  useEffect(() => {
    // Get raw storage data
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    
    setStorageData({
      accessToken: accessToken ? 'Present' : 'Missing',
      refreshToken: refreshToken ? 'Present' : 'Missing',
      user: userStr ? JSON.parse(userStr) : 'Missing',
      allKeys: Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('token') || key.includes('user'))
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Auth Hook State</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">LocalStorage Data</h2>
          <div className="space-y-2">
            <p><strong>Access Token:</strong> {storageData?.accessToken}</p>
            <p><strong>Refresh Token:</strong> {storageData?.refreshToken}</p>
            <p><strong>User Data:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(storageData?.user, null, 2)}
            </pre>
            <p><strong>All Auth Keys:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(storageData?.allKeys, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Permission System</h2>
          <div className="space-y-2">
            <p><strong>Current User (from permissions):</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(getCurrentUser(), null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Storage
            </button>
            <br />
            <button
              onClick={() => window.location.href = '/changelog'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Changelog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 